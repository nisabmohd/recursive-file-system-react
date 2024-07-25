"use client";

import {
  ChevronDownIcon,
  ChevronRightIcon,
  FileIcon,
  FolderIcon,
} from "lucide-react";
import { File, Folder, Struct } from "./file-system";
import { useEffect, useState } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type RestProps = {
  prefix?: string;
  handleAdd: (prefix: string, name: string, type: Category) => void;
  handleRemove: (prefix: string) => void;
  handleRename: (prefix: string, newName: string) => void;
  checkPresence: (
    prefix: string,
    name: string,
    type: Category,
    isRename?: boolean
  ) => boolean;
};

type Category = "file" | "folder";

export default function Node({
  dir,
  prefix = "",
  ...rest
}: { dir: Struct } & RestProps) {
  return (
    <ul className="flex flex-col gap-3 pl-6 pt-2">
      {dir.map((it) => (
        <FolderOrFile
          key={it.name + it.type}
          item={it}
          prefix={prefix == "" ? it.name : prefix + "/" + it.name}
          {...rest}
        />
      ))}
    </ul>
  );
}

function FolderOrFile({
  item,
  prefix,
  ...rest
}: {
  item: Folder | File;
} & RestProps) {
  const [isOpen, setIsOpen] = useState(false);
  const handleToggleOpen = () => setIsOpen((prev) => !prev);
  const [dialogStates, setDialogStates] = useState({
    add: false,
    rename: false,
  });
  const [selectedType, setSelectedType] = useState<"file" | "folder">();
  const { handleAdd, handleRemove, handleRename, checkPresence } = rest;

  return (
    <>
      <li title={prefix}>
        <ContextMenu>
          <ContextMenuTrigger onClick={handleToggleOpen} asChild>
            <div className="flex items-center gap-2.5 cursor-pointer">
              <div className="w-4">
                {item.type === "folder" &&
                  (!isOpen ? (
                    <ChevronRightIcon className="w-4 h-4 cursor-pointer" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4 cursor-pointer" />
                  ))}
              </div>

              {item.type === "folder" ? (
                <FolderIcon className="w-5 h-5 text-yellow-500 fill-current" />
              ) : (
                <FileIcon className="w-5 h-5 text-blue-500 fill-current" />
              )}

              {item.name}
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            {item.type === "folder" && (
              <>
                <ContextMenuItem
                  onClick={() => {
                    setDialogStates((prev) => ({ ...prev, add: true }));
                    setSelectedType("folder");
                  }}
                >
                  Add folder
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => {
                    setDialogStates((prev) => ({ ...prev, add: true }));
                    setSelectedType("file");
                  }}
                >
                  Add file
                </ContextMenuItem>
              </>
            )}
            <ContextMenuItem
              onClick={() => {
                handleRemove(prefix!);
              }}
            >
              Delete
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => {
                setDialogStates((prev) => ({ ...prev, rename: true }));
              }}
            >
              Rename
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        {item.type === "folder" && item.items && isOpen && (
          <Node dir={item.items} prefix={prefix} {...rest} />
        )}
      </li>
      <RenameDialog
        type={item.type}
        currentName={item.name}
        isOpen={dialogStates.rename}
        onSave={(val) => {
          handleRename(prefix!, val);
          setDialogStates((prev) => ({ ...prev, rename: false }));
        }}
        handleOpen={(val) =>
          setDialogStates((prev) => ({ ...prev, rename: val }))
        }
        isAlreadyPresent={(val) => checkPresence(prefix!, val, item.type, true)}
      />
      {selectedType && (
        <AddDilaog
          key={selectedType + dialogStates.add}
          defaultFolderName={
            selectedType == "file" ? "untitled.txt" : "newfolder"
          }
          type={selectedType}
          isOpen={dialogStates.add}
          onSave={(val) => {
            handleAdd(prefix!, val, selectedType);
            setDialogStates((prev) => ({ ...prev, add: false }));
            setIsOpen(true);
          }}
          handleOpen={(val) =>
            setDialogStates((prev) => ({ ...prev, add: val }))
          }
          isAlreadyPresent={(val) => checkPresence(prefix!, val, selectedType)}
        />
      )}
    </>
  );
}

export function FileSystemModule({ struct }: { struct: Struct }) {
  const [data, setData] = useState(struct);
  const [dialogStates, setDialogStates] = useState({
    add: false,
  });
  const [selectedType, setSelectedType] = useState<"file" | "folder">();

  function handleAdd(prefix: string, name: string, type: Category) {
    if (prefix.length == 0) {
      const copydata = [...data];
      copydata.push({ name, type });
      setData(copydata);
      return;
    }
    const paths = prefix.split("/");
    const newdata = structuredClone(data);
    let temp: Struct = newdata;
    paths.forEach((it) => {
      const something = temp.find((item) => item.name == it)!;
      if (something.type == "folder") {
        if (!something.items) something.items = [];
        temp = something.items;
      }
    });
    temp.push({ name, type });
    setData(newdata);
  }

  function handleRename(prefix: string, newName: string) {
    const paths = prefix.split("/");
    if (paths.length == 1) {
      const copydata = [...data];
      const something = data.find((it) => it.name == paths[0])!;
      something.name = newName;
      setData(copydata);
      return;
    }
    const newdata = structuredClone(data);
    let temp: Struct = newdata;
    const name = paths.at(-1)!;
    paths.slice(0, paths.length - 1).forEach((it) => {
      const something = temp.find((item) => item.name == it)!;
      if (something.type == "folder") {
        temp = something.items ?? [];
      }
    });
    const something = temp.find((it) => it.name == name)!;
    something.name = newName;
    temp.splice(0, temp.length, ...temp);
    setData(newdata);
  }

  function handleDelete(prefix: string) {
    const paths = prefix.split("/");
    if (paths.length == 1) {
      const newData = data.filter((it) => it.name != paths[0]);
      setData(newData);
      return;
    }
    const newdata = structuredClone(data);
    let temp: Struct = newdata;
    const name = paths.at(-1)!;
    paths.slice(0, paths.length - 1).forEach((it) => {
      const something = temp.find((item) => item.name == it)!;
      if (something.type == "folder") {
        temp = something.items ?? [];
      }
    });
    const filtered = temp.filter((it) => it.name != name);
    temp.splice(0, temp.length, ...filtered);
    setData(newdata);
  }

  function checkPresence(
    prefix: string,
    name: string,
    type: Category,
    isRename?: boolean
  ) {
    let paths = prefix.split("/");
    if (prefix.length == 0) {
      return !!data.find((it) => it.name == name && it.type == type);
    }
    if (isRename) paths = paths.slice(0, paths.length - 1);
    const newdata = structuredClone(data);
    let temp: Struct = newdata;
    paths.forEach((it) => {
      const something = temp.find((item) => item.name == it)!;
      if (something.type == "folder") {
        temp = something.items ?? [];
      }
    });
    return !!temp.find((it) => it.name == name && it.type == type);
  }

  return (
    <div>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div className="ml-4 mb-1.5 cursor-pointer">dir/root</div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem
            onClick={() => {
              setDialogStates((prev) => ({ ...prev, add: true }));
              setSelectedType("folder");
            }}
          >
            Add folder
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => {
              setDialogStates((prev) => ({ ...prev, add: true }));
              setSelectedType("file");
            }}
          >
            Add file
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {selectedType && (
        <AddDilaog
          key={selectedType + dialogStates.add}
          defaultFolderName={
            selectedType == "file" ? "untitled.txt" : "newfolder"
          }
          type={selectedType}
          isOpen={dialogStates.add}
          onSave={(val) => {
            handleAdd("", val, selectedType);
            setDialogStates((prev) => ({ ...prev, add: false }));
          }}
          handleOpen={(val) =>
            setDialogStates((prev) => ({ ...prev, add: val }))
          }
          isAlreadyPresent={(val) => checkPresence("", val, selectedType)}
        />
      )}
      <Node
        dir={data}
        handleAdd={handleAdd}
        handleRemove={handleDelete}
        handleRename={handleRename}
        checkPresence={checkPresence}
      />
    </div>
  );
}

function RenameDialog({
  onSave,
  isOpen,
  currentName,
  handleOpen,
  isAlreadyPresent,
  type,
}: {
  isOpen: boolean;
  handleOpen: (val: boolean) => void;
  onSave: (name: string) => void;
  currentName: string;
  isAlreadyPresent: (val: string) => boolean;
  type: Category;
}) {
  const [name, setName] = useState(currentName);
  const [isDuplicate, setIsDuplicate] = useState(false);

  useEffect(() => {
    const check = name == currentName ? false : isAlreadyPresent(name);
    setIsDuplicate(check);
  }, [name, isAlreadyPresent, currentName]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rename it to something else</DialogTitle>
          <DialogDescription>
            Make changes to your file or folder name here. Click save when youre
            done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Label htmlFor="name">New name</Label>
          <Input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
            id="name"
            className="col-span-3"
          />
          <p className="text-red-600">
            {isDuplicate && `${type} named ${name} is already present`}
          </p>
        </div>
        <DialogFooter>
          <Button
            disabled={!name || isDuplicate || name == currentName}
            onClick={() => onSave(name)}
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddDilaog({
  onSave,
  isOpen,
  handleOpen,
  type,
  defaultFolderName,
  isAlreadyPresent,
}: {
  isOpen: boolean;
  handleOpen: (val: boolean) => void;
  type: Category;
  onSave: (name: string) => void;
  defaultFolderName: string;
  isAlreadyPresent: (val: string) => boolean;
}) {
  const [name, setName] = useState(defaultFolderName);
  const [isDuplicate, setIsDuplicate] = useState(false);

  useEffect(() => {
    const check = isAlreadyPresent(name);
    setIsDuplicate(check);
  }, [name, isAlreadyPresent]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add new {type} </DialogTitle>
          <DialogDescription>Add new {type} into your dir</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Label htmlFor="name">New name</Label>
          <Input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
            id="name"
            className="col-span-3"
          />
          <p className="text-red-600">
            {isDuplicate && `${type} named ${name} is already present`}
          </p>
        </div>
        <DialogFooter>
          <Button disabled={!name || isDuplicate} onClick={() => onSave(name)}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
