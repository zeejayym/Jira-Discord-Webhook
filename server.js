const fs = require("fs");
const path = require("path");
const fastify = require("fastify")({ logger: false });

// Register static file handling and view engine
fastify.register(require("@fastify/static"), {
  root: path.join(__dirname, "public"),
  prefix: "/",
});

fastify.register(require("@fastify/view"), {
  engine: {
    handlebars: require("handlebars"),
  },
});

// Root route to display homepage
fastify.get("/", (request, reply) => {
  reply.view("/src/pages/index.hbs");
});

fastify.post("/webhook", async (request, reply) => {
  try {
    const { webhookEvent, issue, user, changelog } = request.body;
    const issueKey = issue?.key || "Unknown Issue";
    const issueSummary = issue?.fields?.summary || "No Summary";
    const issueUrl = `https://paddock.atlassian.net/browse/${issueKey}`;
    const actionUser = user?.displayName || "Unknown User";

    // Determine the type of action (created, updated, deleted)
    let actionType = "Jira Issue Updated"; // Default title
    if (webhookEvent === "jira:issue_created") {
      actionType = "Jira Issue Created";
    } else if (webhookEvent === "jira:issue_deleted") {
      actionType = "Jira Issue Deleted";
    } else if (webhookEvent === "jira:issue_updated") {
      actionType = "Jira Issue Updated";
    }

    // Check if this is a subtask
    const issueType = issue?.fields?.issuetype?.subtask ? "Subtask" : "Issue";
    if (issueType === "Subtask" && webhookEvent === "jira:issue_created") {
      actionType = "Jira Subtask Created";
    } else if (issueType === "Subtask" && webhookEvent === "jira:issue_updated") {
      actionType = "Jira Subtask Updated";
    } else if (issueType === "Subtask" && webhookEvent === "jira:issue_deleted") {
      actionType = "Jira Subtask Deleted";
    }

    // Determine if the assignee was changed
    let assigneeChange = "";
    if (changelog && changelog.items) {
      const assigneeItem = changelog.items.find((item) => item.field === "assignee");
      if (assigneeItem) {
        const from = assigneeItem.fromString || "Unassigned";
        const to = assigneeItem.toString || "Unassigned";
        assigneeChange = `Assignee changed from \`${from}\` to \`${to}\`.`;
      }
    }

    // Construct the message
    const discordMessage = {
      content: `**${actionType}** 🚨\n**Key:** ${issueKey}\n**Summary:** ${issueSummary}\n**Updated by:** ${actionUser}\n${assigneeChange}\n[View ${issueType}](${issueUrl})`,
    };

    // Send the message to Discord
    const discordWebhookURL = process.env.DISCORD_WEBHOOK_URL;
    if (!discordWebhookURL) {
      throw new Error("Discord webhook URL is not set in environment variables.");
    }

    const response = await fetch(discordWebhookURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(discordMessage),
    });

    if (!response.ok) {
      throw new Error(`Error sending to Discord: ${response.statusText}`);
    }

    console.log("Message sent to Discord successfully!");
    reply.code(200).send({ status: "Success", message: "Webhook processed" });
  } catch (error) {
    console.error("Error handling webhook:", error);
    reply.code(500).send({ status: "Error", message: error.message });
  }
});

fastify.listen(
  { port: process.env.PORT || 3000, host: "0.0.0.0" },
  (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Your app is listening on ${address}`);
  }
);
