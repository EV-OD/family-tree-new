import { useState, useEffect, useCallback } from "react";
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  getDocs, 
  setDoc, 
  doc 
} from "firebase/firestore";
import { db } from "@/firebase";
import { FamilyMember } from "@/types/familyTypes";

export const useFamilyTree = (treeName: string = "Default Tree") => {
  const [nodes, setNodes] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  if(treeName.length == 0){
    treeName = "Default Tree";
  }

  const membersRef = collection(db, "familyMembersTest");

  const ensureCollectionExists = useCallback(async () => {
    try {
      const snapshot = await getDocs(query(membersRef, where("treename", "==", treeName)));
      console.log("Snapshot:", snapshot);
      if (snapshot.empty) {
        const docRef = doc(membersRef); // Create a new document reference
        await setDoc(docRef, {
          name: "",
          treename: treeName,
          gender: "",
          dob: null,
          phone: null,
          fid: [],
          mid: [],
          pids: [],
        });
        console.log("Root member document created.");
      }
    } catch (err) {
      console.error("Error ensuring collection existence:", err);
      setError("Failed to check or create the collection.");
      throw err;
    }
  }, [membersRef, treeName]);

  useEffect(() => {
    setLoading(true);

    // ensureCollectionExists()
      // .then(() => {
        const q = query(membersRef, where("treename", "==", treeName));
        const unsubscribe = onSnapshot(
          q,
          (querySnapshot) => {
            const nodes = querySnapshot.docs.map((doc) => {
              const data = doc.data()
              return {
              id: doc.id,
              name: data.name || "",
              gender: data.gender || "",
              img: data.img || "",
              dob: data.dob || "",
              phone: data.phone || "",
              pids: data.pids || [],
              fid: data.fid || [],
              mid: data.mid || [],
              treename: data.treename || "",
              linkedTree: data.linkedTree || "",
            } as FamilyMember
            }
          );
            setNodes(nodes);
            console.log("Nodes:", nodes);
            setLoading(false);
          },
          (err) => {
            console.error("Error fetching members:", err);
            setError("Failed to fetch family members.");
            setLoading(false);
          }
        );

        return () => unsubscribe();
      // })
      // .catch((err) => {
      //   console.error("Error initializing family tree:", err);
      //   setError("Failed to initialize family tree collection.");
      //   setLoading(false);
      // });
  }, [treeName]);

  return { nodes, loading, error };
};
