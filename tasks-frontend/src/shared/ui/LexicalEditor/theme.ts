import type { EditorThemeClasses } from "lexical";

export const lexicalTheme: EditorThemeClasses = {
  root: "lexical-root",
  paragraph: "lexical-paragraph",
  heading: {
    h1: "lexical-h1",
    h2: "lexical-h2",
    h3: "lexical-h3",
  },
  text: {
    bold: "lexical-bold",
    italic: "lexical-italic",
    underline: "lexical-underline",
    strikethrough: "lexical-strikethrough",
    code: "lexical-code-text",
  },
  list: {
    ul: "lexical-ul",
    ol: "lexical-ol",
    listitem: "lexical-listitem",
    nested: {
      listitem: "lexical-nested-listitem",
    },
  },
  link: "lexical-link",
  code: "lexical-code",
  quote: "lexical-quote",
};
