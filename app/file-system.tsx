import Node from "./node";

export type File = {
  name: string;
  type: "file";
};

export type Folder = {
  name: string;
  type: "folder";
  items?: Struct;
};

export type Struct = (Folder | File)[];

const rootDir: Struct = [
  {
    name: "app",
    type: "folder",
    items: [
      {
        name: "blog",
        type: "folder",
        items: [
          {
            name: "page.tsx",
            type: "file",
          },
          {
            name: "layout.tsx",
            type: "file",
          },
          {
            name: "loading.tsx",
            type: "file",
          },
          {
            name: "[slug]",
            type: "folder",
            items: [
              {
                name: "page.tsx",
                type: "file",
              },
              {
                name: "layout.tsx",
                type: "file",
              },
              {
                name: "loading.tsx",
                type: "file",
              },
            ],
          },
        ],
      },
      {
        name: "about",
        type: "folder",
        items: [
          {
            name: "page.tsx",
            type: "file",
          },
          {
            name: "error.tsx",
            type: "file",
          },
        ],
      },
      {
        name: "layout.tsx",
        type: "file",
      },
      {
        name: "page.tsx",
        type: "file",
      },
      {
        name: "not-found.tsx",
        type: "file",
      },
    ],
  },
  {
    name: "components",
    type: "folder",
    items: [
      {
        name: "button.tsx",
        type: "file",
      },
      {
        name: "dialog.tsx",
        type: "file",
      },
    ],
  },
  {
    name: "middleware.ts",
    type: "file",
  },
  {
    name: "public",
    type: "folder",
    items: [
      {
        name: "images",
        type: "folder",
        items: [
          {
            name: "cover.png",
            type: "file",
          },
        ],
      },
      {
        name: "fonts",
        type: "folder",
        items: [
          {
            name: "inter.ttf",
            type: "file",
          },
          {
            name: "poppins.ttf",
            type: "file",
          },
        ],
      },
    ],
  },

  {
    name: "package.json",
    type: "file",
  },
  {
    name: "package-lock.json",
    type: "file",
  },
];

export default function FileSystem() {
  return <Node dir={rootDir} />;
}
