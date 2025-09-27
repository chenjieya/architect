import fs from "fs/promises";
import path from "path";
import { marked } from "marked";

export default function () {
  return {
    name: "markdown",
    setup(build) {
      build.onResolve({ filter: /\.md$/ }, (args) => {
        const basePath = path.isAbsolute(args.path)
          ? args.path
          : path.join(args.resolveDir, args.path);

        return {
          path: basePath,
          namespace: "alvis-markdown"
        };
      });

      build.onLoad(
        { filter: /.*/, namespace: "alvis-markdown" },
        async (args) => {
          const content = await fs.readFile(args.path, "utf-8");

          const markdownHtml = marked.parse(content);

          return {
            contents: JSON.stringify({
              html: markdownHtml,
              raw: content,
              filename: path.basename(args.path)
            }),
            loader: "json"
          };
        }
      );
    }
  };
}
