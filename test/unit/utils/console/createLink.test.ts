import { assert } from "chai";
import createLink from "@/utils/console/createLink";

describe("createLink", () => {
  it("可以生成链接 新标签页打开", () => {
    assert.equal(
      createLink("TestLinkContent", "https://example.com/"),
      '<a href="https://example.com/" target="_blank">TestLinkContent</a>'
    );
  });

  it("可以生成链接 不在新标签页打开", () => {
    assert.equal(
      createLink("TestLinkContent", "https://example.com/", false),
      '<a href="https://example.com/" target="_self">TestLinkContent</a>'
    );
  });
});
