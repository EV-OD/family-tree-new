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
} from "@/services/familyService";
import { FamilyMember } from "@/types/familyTypes";
import { DebugInfo } from "./DebugInfo";

const FamilyTreeComponent: React.FC = () => {
  const divRef = useRef<HTMLDivElement>(null);
  const familyTreeRef = useRef<FamilyTree | null>(null);
  const { nodes, loading, error } = useFamilyTree();
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>("");

  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  useEffect(() => {
    async function rootNodeSelector() {
      const rootFamilyMember = await getRootFamilyMember();
      setSelectedNode(rootFamilyMember[0].id);
    }
    rootNodeSelector();
  }, []);

  useEffect(() => {
    if (divRef.current && nodes.length > 0 && !loading) {
      try {
        if (familyTreeRef.current) {
          familyTreeRef.current.destroy();
          divRef.current.innerHTML = "";
        }

        let newNode = nodes.map((node) => {
          let obj = {
            id: node.id,
            name: node.name ?? "",
            gender: node.gender ?? "",
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
          if (node.pids) {
            obj["pids"] = node.pids;
          }
          return obj;
        });

        const f = new FamilyTree(divRef.current, {
          nodes: newNode,
          template: "rabin",
          nodeBinding: {
            field_0: "name",
            img_0: "img",
          },
          levelSeparation: 100,
          siblingSeparation: 50,
          subtreeSeparation: 100,
          toolbar: {
            zoom: true,
            fit: true,
          },
          roots: selectedNode ? [selectedNode] : [],
        });

        familyTreeRef.current = f;
        familyTreeRef.current.onUpdateNode(handleEdit);

        setDebugInfo("Family tree initialized successfully");
      } catch (err) {
        console.error("Error initializing family tree:", err);
        setDebugInfo(`Error initializing family tree: ${err}`);
      }
    }
  }, [nodes, loading]);

  type argsType = {
    addNodesData: Array<object>;
    updateNodesData: Array<{[key: string]: string}>;
    removeNodeId: number | string;
  };

  const handleEdit = async (args: argsType) => {
    console.log("Edit node:", args);
    if (args.updateNodesData.length > 0) {
      const nodesToEdit = args.updateNodesData;
      nodesToEdit.forEach((node) => {
        updateFamilyMember(node.id, {
          name: node.name,
          gender: node.gender,
          img: node.img,
        }).catch((error) => {
          console.error("Error updating document: ", error);
        });
      });
    }
    if(args.removeNodeId !== null) {
      try{
        let s = await deleteFamilyMember(args.removeNodeId.toString());
        console.log("Document successfully removed!");
        console.log(s);
        return true;
      }
      catch(error){
        console.error("Error removing document: ", error);
        return false;
      }
    }
    return false;
  };

  const handleAdd = () => {
    console.log("Add new member");
    setIsAddFormOpen(true);
  };


  const setRootNode = () => {
    if (!familyTreeRef.current || !selectedNode) return;
    setRootFamilyMember(selectedNode)
      .then(() => {
        if (!familyTreeRef.current || !selectedNode) return;
        familyTreeRef.current.config.roots = [selectedNode];
        familyTreeRef.current?.draw();
      })
      .catch((error) => {
        console.error("Error setting root family member: ", error);
      });
  };

  const handleAddMember = (newMember: FamilyMember) => {
    setIsAddFormOpen(false);
    console.log("New member added:", newMember);
  };

  if (loading) {
    return <div>Loading family tree data...</div>;
  }

  if (error) {
    return <div>Error loading family tree data: {error}</div>;
  }

  return (
    <div className="flex flex-col md:flex-row w-full h-screen">
      <div
        className="w-full md:w-3/4 h-full"
        style={{ height: "100vh" }}
        ref={divRef}
      ></div>
      <div className="w-full md:w-1/4 p-4 bg-gray-100">
        <div className="mb-4">
          <label htmlFor="rootNodeSelect" className="block mb-2">
            Select Root Node:
          </label>
          <select
            id="rootNodeSelect"
            className="w-full p-2 border border-gray-300 rounded"
            onChange={(e) => {
              const selectedNodeId = e.target.value;
              setSelectedNode(selectedNodeId);
            }}
          >
            {nodes.map((node) => (
              <option
                key={node.id}
                value={node.id}
                selected={selectedNode === node.id}
              >
                {node.name}
              </option>
            ))}
          </select>
          <Button className="mb-4" onClick={setRootNode}>
            Set as Root Node
          </Button>
        </div>
        <Button onClick={handleAdd} className="mb-4">
          Add Member
        </Button>
        {isAddFormOpen && (
          <AddMemberForm
            onSubmit={handleAddMember}
            onCancel={() => setIsAddFormOpen(false)}
            existingNodes={nodes}
          />
        )}
        <DebugInfo info={debugInfo} nodeCount={nodes.length} />
      </div>
    </div>
  );
};

export default FamilyTreeComponent;