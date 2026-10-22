import test from "node:test";
import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";
test("stdio protocol supports discovery, search → prepare, resources, prompts, and errors", async () => {
  const client = new Client({ name: "motion-protocol-test", version: "1.0.0" });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [new URL("../dist/src/stdio.js", import.meta.url).pathname],
    stderr: "pipe",
  });
  try {
    await client.connect(transport);
    const { tools } = await client.listTools();
    assert.deepEqual(tools.map((t) => t.name).sort(), [
      "get_motion",
      "prepare_motion",
      "search_motion",
    ]);
    assert.ok(tools.every((t) => t.annotations.readOnlyHint));
    const found = await client.callTool({
      name: "search_motion",
      arguments: { query: "magnetic button" },
    });
    assert.ok(!found.isError);
    const id = JSON.parse(found.content[0].text).results[0].id;
    const prepared = await client.callTool({
      name: "prepare_motion",
      arguments: { id, brief: "A button for an agency site" },
    });
    assert.ok(
      JSON.parse(prepared.content[0].text).prompt.includes("agency site"),
    );
    const prompts = await client.listPrompts();
    assert.equal(prompts.prompts[0].name, "use-motion");
    const prompt = await client.getPrompt({
      name: "use-motion",
      arguments: { id, brief: "My product" },
    });
    assert.ok(prompt.messages[0].content.text.includes("My product"));
    const resource = await client.readResource({
      uri: `motion://recipes/${id}`,
    });
    assert.ok(resource.contents[0].text.includes(id));
    const missing = await client.callTool({
      name: "get_motion",
      arguments: { id: "absent" },
    });
    assert.equal(missing.isError, true);
    const bad = await client.callTool({
      name: "prepare_motion",
      arguments: { id, brief: "x", customization: { surprise: true } },
    });
    assert.equal(bad.isError, true);
  } finally {
    await client.close();
  }
});
