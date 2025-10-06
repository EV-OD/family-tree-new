export interface FamilyMember {
    id: string;
    name?: string | undefined;
    phone?: string | undefined;
    dob?: string | undefined;
    img?: string | null | undefined;
    imgKey?: string | null | undefined;
    pids?: string[] | undefined;
    fid?: string[] | undefined;
    mid?: string[] | undefined;
  gender?: string | undefined;
  treename?: string | undefined;
  linkedTree?: string | undefined;
}

export interface AddMemberFormProps {
  onSubmit: (member: FamilyMember) => void;
  onCancel: () => void;
  existingNodes: FamilyMember[];
  currentTreeName: string;
}