import React, { useEffect, useRef, useState } from "react";
import FamilyTree from "@/family-tree/wrapper";
import { Button } from "@/components/ui/button";
import AddMemberForm from "@/forms/AddMemberForm";
import { useFamilyTree } from "@/hooks/useFamilyTree";
import {
  updateFamilyMember,
  deleteFamilyMember,
  setRootFamilyMember,
  getRootFamilyMember,
  uploadPhoto,
  getFamilyInfo,
  clearNoExistantData,
  getTreeNames,
  deleteTree,
  downLoadFamilyMembersToTxt,
} from "@/services/familyService";
// import { FamilyMember } from "@/types/familyTypes";
import useFamilyStore from "@/store/globalFamily";
import { GearIcon, Cross1Icon, TrashIcon } from "@radix-ui/react-icons";
import { useToast } from "@/hooks/use-toast";
import imageCompression from "browser-image-compression";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DownloadIcon } from "lucide-react";

const FamilyTreeComponent: React.FC = () => {
  const divRef = useRef<HTMLDivElement>(null);
  const familyTreeRef = useRef<FamilyTree | null>(null);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const { toast } = useToast();

  const user = useFamilyStore((state) => state.user);

  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isSetting, setIsSetting] = useState(false);
  const [selectedTreeName, setSelectedTreeName] = useState<string>("");
  const [treeNames, setTreeNames] = useState<string[]>([]);
  const { nodes, loading, error } = useFamilyTree(selectedTreeName);
  const [isNewTreeDialogOpen, setIsNewTreeDialogOpen] = useState(false);
  const [newTreeName, setNewTreeName] = useState("");
  const [linkTreeDialogOpen, setLinkTreeDialogOpen] = useState(false);
  const [selectedMemberForLink, setSelectedMemberForLink] = useState<string | null>(null);
  const [selectedTreeForLink, setSelectedTreeForLink] = useState<string>("");
  const [currentLinkedTree, setCurrentLinkedTree] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTreeNames() {
      try {
        const names = await getTreeNames();
        setTreeNames(names);
        if (names.length > 0 && !selectedTreeName) {
          setSelectedTreeName(names[0]);
        }
      } catch (error) {
        console.error("Error fetching tree names:", error);
      }
    }

    fetchTreeNames();
  }, []);

  useEffect(() => {
    async function rootNodeSelector() {
      if (selectedTreeName) {
        const rootMemberId = await getRootFamilyMember(selectedTreeName);
        setSelectedNode(rootMemberId);
      } else {
        setSelectedNode(null);
      }
    }
    rootNodeSelector();

    document.addEventListener("click", (e) => {
      const searchElt = document.querySelector(".bft-search");
      // console.log("searchElt", searchElt);
      if (searchElt) {
        const lastChild = searchElt.lastElementChild;
        // console.log("lastChild", lastChild);
        if (lastChild) {
          const tr = lastChild.querySelectorAll("tr");
          tr.forEach((el) => {
            el.addEventListener("click", () => {
              // console.log("click");

              lastChild.innerHTML = "";
            });
          });
        }
      }
    });
  }, [selectedTreeName]);

  useEffect(() => {
    if (divRef.current && nodes.length > 0 && !loading) {
      clearNoExistantData();
      try {
        // if (familyTreeRef.current) {
        //   familyTreeRef.current.destroy();
        //   divRef.current.innerHTML = "";
        // }
        console.log(nodes);

        const newNode = nodes.map((node) => {
          const familyInfo = getFamilyInfo(nodes, node.id);
          console.log(familyInfo);

          const obj = {
            id: node.id,
            name: node.name ?? "",
            gender: node.gender ?? "",
            dob: node.dob ?? "",
            phone: node.phone ?? "",
            partner: familyInfo?.partners.join(", ") ?? "",
            children: familyInfo?.children.join(", ") ?? "",
            grandchildren: familyInfo?.grandchildren.join(", ") ?? "",
          };

          if (node.img) {
            obj["img"] = node.img;
          }
          if (node.fid?.length > 0) {
            obj["fid"] = node.fid;
          }
          if (node.mid?.length > 0) {
            obj["mid"] = node.mid;
          }
          if (node.pids && node.pids.length > 0) {
            obj["pids"] = node.pids;
          }
          // If this member links to another tree, expose a small inline button (rendered by template)
          if (node.linkedTree) {
            obj["linkTree"] = `<button class="link-tree-btn" data-nodeid="${node.id}" title="Go to linked tree">🔗</button>`;
          }
          return obj;
        });
        console.log(newNode);

        const f = new FamilyTree(divRef.current, {
          nodes: newNode,
          template: "atul",
          nodeBinding: {
            field_0: "name",
            field_1: "partner",
            field_2: "children",
            field_3: "grandchildren",
            field_4: "linkTree",
            img_0: "img",
          },
          searchFields: ["name"],
          levelSeparation: 100,
          siblingSeparation: 50,
          subtreeSeparation: 100,
          toolbar: {
            zoom: true,
            fit: true,
          },
          roots: selectedNode ? [selectedNode] : [],
          editForm: {
            elements: [
              { type: "textbox", label: "Full Name", binding: "name" },
              { type: "textbox", label: "Gender", binding: "gender" },
              {
                type: "textbox",
                label: "Photo Url",
                binding: "img",
                btn: "Upload",
              },
              [
                { type: "textbox", label: "Phone", binding: "phone" },
                { type: "date", label: "Date Of Birth", binding: "dob" },
              ],
              {
                type: "select",
                label: "Link to Tree",
                binding: "linkToTree",
                options: [...new Set(treeNames.filter(name => name !== selectedTreeName))].map(name => ({ value: name, text: name }))
              }
            ],
            buttons: {
              edit: {
                icon: FamilyTree.icon.edit(24, 24, '#fff'),
                text: 'Edit',
                hideIfEditMode: true,
                hideIfDetailsMode: false
              },
              linkTree: {
                icon: FamilyTree.icon.link(24, 24, '#fff'),
                text: 'Link with Tree',
                // show when opening node in details/read-only mode
                hideIfEditMode: true,
                hideIfDetailsMode: false
              }
            },
            addMore: "",
          },
        });

        familyTreeRef.current = f;
        familyTreeRef.current.onUpdateNode(handleEdit);
        // Attach delegated click handler to capture clicks on the inline link buttons inside nodes
        const handleContainerClick = (ev: MouseEvent) => {
          const target = ev.target as HTMLElement;
          const btn = target.closest('.link-tree-btn') as HTMLElement | null;
          if (btn) {
            const nodeId = btn.getAttribute('data-nodeid');
            if (nodeId) {
              // switch to linked tree for this node
              switchToLinkedTree(nodeId);
            }
          }
        };

        divRef.current?.addEventListener('click', handleContainerClick);

        // cleanup listener when nodes change or component unmounts
        const cleanupListener = () => {
          divRef.current?.removeEventListener('click', handleContainerClick);
        };
        
        // Handle element button clicks (Upload button)
        familyTreeRef.current.editUI.on(
          "element-btn-click",
          function (sender, args) {
            if (args.event.target.innerHTML == "Upload") {
              FamilyTree.fileUploadDialog(async function (file) {
                const options = {
                  maxSizeMB: 0.2,
                  useWebWorker: true,
                };
                try {
                  toast({
                    title: "Uploading Image",
                    description:
                      "We are uploading your image, wait for a moment",
                  });
                  const compressedFile = await imageCompression(file, options);
                  const imageUrl = await uploadPhoto(compressedFile);
                  let nodeId = args.nodeId;
                  updateFamilyMember(nodeId, { img: imageUrl }).then(() => {
                    toast({
                      title: "Success",
                      description: "Image uploaded successfully",
                    });
                  });
                } catch (error) {
                  console.error("Error compressing image: ", error);
                  toast({
                    title: "Error",
                    description: "Failed to compress image",
                    variant: "destructive",
                  });
                }
              });
            }
          }
        );

        // Handle form button clicks (Link with Tree button)
        familyTreeRef.current.editUI.on(
          "button-click",
          function (sender, args) {
            if (args.name === "linkTree") {
              // Open local React modal instead of using FamilyTree's internal select
              const member = nodes.find((n: any) => n.id === args.nodeId) as any;
              const existingLinked: string = member?.linkedTree || "";
              // prefer showing a linked tree that's not the current tree
              const preferred = (existingLinked && existingLinked !== selectedTreeName) ? existingLinked : "";
              setSelectedMemberForLink(args.nodeId);
              setSelectedTreeForLink(preferred);
              setCurrentLinkedTree(existingLinked || null);
              setLinkTreeDialogOpen(true);
            }
          }
        );
        // ensure cleanup is available on unmount
        return () => {
          cleanupListener();
        };
      } catch (err) {
        console.error("Error initializing family tree:", err);
      }
    }
  }, [nodes, loading]);

  const showPermissionToast = () => {
    toast({
      title: "Insufficient permissions",
      description: "Please contact admin",
      variant: "destructive",
    });
  };

  const switchToLinkedTree = async (nodeId: string) => {
    try {
      const member = nodes.find((n: any) => n.id === nodeId) as any;
      const targetTree = member?.linkedTree;
      if (!targetTree) {
        toast({ title: 'Error', description: 'No linked tree found for this member', variant: 'destructive' });
        return;
      }

      // destroy current family tree instance
      if (familyTreeRef.current) {
        try {
          familyTreeRef.current.destroy();
        } catch (e) {
          // ignore destroy errors
        }
        familyTreeRef.current = null;
      }

      // set the selected tree name which will trigger hook to load nodes for that tree
      setSelectedTreeName(targetTree);

      // reset selected node (root will be set by effect that reads rootFamilyMembers)
      setSelectedNode(null);
    } catch (error) {
      console.error('Error switching to linked tree:', error);
      toast({ title: 'Error', description: 'Failed to switch tree', variant: 'destructive' });
    }
  };

  type argsType = {
    addNodesData: Array<object>;
    updateNodesData: Array<{ [key: string]: string }>;
    removeNodeId: number | string;
  };

  const handleEdit = async (args: argsType) => {
    if (args.updateNodesData.length > 0) {
      const nodesToEdit = args.updateNodesData;
      for (const node of nodesToEdit) {
        try {
          // Handle tree linking if linkToTree is provided
          if (node.linkToTree && node.linkToTree !== selectedTreeName) {
            await handleLinkToTree(node.id, node.linkToTree);
          }
          
          // Update regular family member fields
          await updateFamilyMember(node.id, {
            name: node.name,
            gender: node.gender,
            img: node.img,
            phone: node.phone,
            dob: node.dob,
          });
        } catch (error) {
          if (error.code === "permission-denied") {
            console.error("Insufficient permissions to update the document.");
            showPermissionToast();
          } else {
            console.error("Error updating document: ", error);
            toast({
              title: "Error",
              description: "Failed to update family member",
              variant: "destructive",
            });
          }
        }
      }
    }

    if (args.removeNodeId !== null) {
      try {
        await deleteFamilyMember(args.removeNodeId.toString());
        console.log("Document successfully removed!");
        toast({
          title: "Success",
          description: "Family member removed successfully",
        });
        return true;
      } catch (error) {
        if (error.code === "permission-denied") {
          showPermissionToast();
        } else {
          console.error("Error removing document: ", error);
          toast({
            title: "Error",
            description: "Failed to remove family member",
            variant: "destructive",
          });
        }
      }
    }
    return false;
  };

  const handleAdd = () => {
    setIsAddFormOpen(true);
  };

  const handleLinkToTree = async (nodeId: string, targetTreeName: string) => {
    if (!targetTreeName || !nodeId) {
      toast({
        title: "Error",
        description: "Please select a tree to link to",
        variant: "destructive",
      });
      return;
    }

    try {
      // Find the node in the currently loaded nodes to get existing linkedTree
      const member = nodes.find((n: any) => n.id === nodeId) as any;
      const existingLinked: string = member?.linkedTree || "";

      if (existingLinked === targetTreeName) {
        toast({
          title: "Info",
          description: `Member already linked to ${targetTreeName}`,
        });
        return;
      }

      // For uniqueness, set linkedTree to the selected value
      await updateFamilyMember(nodeId, { linkedTree: targetTreeName });

      toast({
        title: "Success",
        description: `Member linked to ${targetTreeName} tree successfully`,
      });
    } catch (error) {
      console.error("Error linking member to tree:", error);
      toast({
        title: "Error",
        description: "Failed to link member to tree",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTree = async () => {
    if (!selectedTreeName) return;

    try {
      await deleteTree(selectedTreeName);
      toast({
        title: "Success",
        description: `Tree "${selectedTreeName}" deleted successfully`,
      });
      setTreeNames((prevNames) =>
        prevNames.filter((name) => name !== selectedTreeName)
      );
      setSelectedTreeName("");
    } catch (error) {
      console.error("Error deleting tree:", error);
      toast({
        title: "Error",
        description: "Failed to delete tree",
        variant: "destructive",
      });
    }
  }

  const setRootNode = () => {
    if (!familyTreeRef.current || !selectedNode || !selectedTreeName) return;
    setRootFamilyMember(selectedNode, selectedTreeName)
      .then(() => {
        if (!familyTreeRef.current || !selectedNode) return;
        familyTreeRef.current.config.roots = [selectedNode];
        familyTreeRef.current?.draw();
      })
      .catch((error) => {
        console.error("Error setting root family member: ", error);
      });
  };

  const handleFormSubmit = async () => {
    setIsAddFormOpen(false);
    // try {
    //   const addedMember = await addFamilyMember(newMember, null);
    //   if (familyTreeRef.current) {
    //     familyTreeRef.current.addNode(addedMember);
    //   }
    //   toast({
    //     title: "Success",
    //     description: "New family member added successfully",
    //   });
    // } catch (error) {
    //   console.error("Error adding family member:", error);
    //   toast({
    //     title: "Error",
    //     description: "Failed to add family member",
    //     variant: "destructive",
    //   });
    // }
  };

  const createNewTree = () => {
    if (newTreeName.trim() === "") {
      toast({
        title: "Error",
        description: "Please enter a name for the new tree",
        variant: "destructive",
      });
      return;
    }

    setTreeNames((prevNames) => [...prevNames, newTreeName]);
    setSelectedTreeName(newTreeName);
    setNewTreeName("");
    setIsNewTreeDialogOpen(false);

    toast({
      title: "Success",
      description: `New tree "${newTreeName}" created successfully`,
    });

    // if (familyTreeRef.current) {
    //   familyTreeRef.current.destroy();
    //   if (divRef.current) {
    //     divRef.current.innerHTML = "";
    //   }
    // }

    // familyTreeRef.current = new FamilyTree(divRef.current, {
    //   nodes: [],
    //   nodeBinding: {
    //     field_0: "name",
    //     img_0: "img",
    //   },
    // });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        Error loading family tree data: {error}
      </div>
    );
  }

  return (
    <div className="flex w-full h-screen">
      <div
        className={`fixed top-0 left-0 w-full md:w-1/5 h-full bg-white shadow-lg p-4 transition-transform duration-300 ease-in-out z-50 ${
          isSetting ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <Button
            onClick={() => setIsSetting(false)}
            variant="ghost"
            size="icon"
          >
            <Cross1Icon />
          </Button>
        </div>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="treeSelect"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Select Tree:
            </label>
            <div className="flex gap-2">
              <Select
                value={selectedTreeName}
                onValueChange={setSelectedTreeName}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a tree" />
                </SelectTrigger>
                <SelectContent>
                  {treeNames.map((treeName) => (
                    <SelectItem key={treeName} value={treeName}>
                      {treeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="default"
                className="w-12"
                size="icon"
                onClick={handleDeleteTree}
              >
                <TrashIcon />
              </Button>
            </div>
            <Button
                variant="default"
                className="absolute bottom-7 left-3 p-[10px]"
                size="icon"
                onClick={()=> downLoadFamilyMembersToTxt()}
              >
                <DownloadIcon/>
              </Button>
          </div>

          <Button
            onClick={() => setIsNewTreeDialogOpen(true)}
            className="w-full"
          >
            Create New Tree
          </Button>
          <div>
            <label
              htmlFor="rootNodeSelect"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Select Root Node:
            </label>
            <select
              id="rootNodeSelect"
              className="w-full p-2 border border-gray-300 rounded"
              onChange={(e) => setSelectedNode(e.target.value)}
              value={selectedNode || ""}
            >
              {nodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.name}
                </option>
              ))}
            </select>
          </div>
          <Button onClick={setRootNode} className="w-full">
            Set as Root Node
          </Button>
          <Button onClick={handleAdd} className="w-full">
            Add Member
          </Button>
        </div>
      </div>
      <div className="flex-1 relative">
        <div
          className="w-full h-full"
          style={{ height: "90dvh" }}
          ref={divRef}
        ></div>
        {!isSetting && (
          <Button
            className="absolute bottom-7 left-3"
            onClick={() => setIsSetting(true)}
            variant="default"
            size="icon"
          >
            <GearIcon />
          </Button>
        )}

        <Select value={selectedTreeName} onValueChange={setSelectedTreeName}>
          <SelectTrigger className="absolute bottom-7 right-3 w-48">
            <SelectValue placeholder="Select a tree" />
          </SelectTrigger>
          <SelectContent>
            {[...new Set(treeNames)].map((treeName) => (
              <SelectItem key={treeName} value={treeName}>
                {treeName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {isAddFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 transition-transform duration-500 ease-in-out">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md ">
            <AddMemberForm
              onSubmit={handleFormSubmit}
              onCancel={() => setIsAddFormOpen(false)}
              existingNodes={nodes}
              currentTreeName={selectedTreeName}
            />
          </div>
        </div>
      )}

      <Dialog open={isNewTreeDialogOpen} onOpenChange={setIsNewTreeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Tree</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="text"
              placeholder="Enter tree name"
              value={newTreeName}
              onChange={(e) => setNewTreeName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              onClick={() => setIsNewTreeDialogOpen(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button onClick={createNewTree}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link with Tree Dialog (opened when user clicks the linkTree button in the edit form) */}
      <Dialog open={linkTreeDialogOpen} onOpenChange={setLinkTreeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link Member with Tree</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Select a target tree to link this member with. Existing links are shown below.
          </DialogDescription>
          <div className="py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currently linked trees:</label>
              <div className="text-sm text-muted-foreground">
                {currentLinkedTree !== null
                  ? (currentLinkedTree ? currentLinkedTree : "(none)")
                  : (selectedMemberForLink && (() => {
                      const member = nodes.find((n: any) => n.id === selectedMemberForLink) as any;
                      const existing = member?.linkedTree || "";
                      return existing ? existing : "(none)";
                    })()) || "(none)"
                }
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Tree to Link:</label>
              <Select value={selectedTreeForLink} onValueChange={setSelectedTreeForLink}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a tree" />
                </SelectTrigger>
                <SelectContent>
                  {treeNames.filter(name => name !== selectedTreeName).map((treeName) => (
                    <SelectItem key={treeName} value={treeName}>{treeName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setLinkTreeDialogOpen(false)} variant="outline">Cancel</Button>
            <Button onClick={async () => {
              if (!selectedMemberForLink) return;
              if (!selectedTreeForLink) {
                toast({ title: 'Error', description: 'Please select a tree', variant: 'destructive' });
                return;
              }
              await handleLinkToTree(selectedMemberForLink, selectedTreeForLink);
              // optimistic update of modal display
              setCurrentLinkedTree((prev) => (prev === selectedTreeForLink ? prev : selectedTreeForLink));
              setLinkTreeDialogOpen(false);
            }}>
              Link with Tree
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FamilyTreeComponent;
