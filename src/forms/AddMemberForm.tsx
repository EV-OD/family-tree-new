import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addFamilyMember } from "@/services/familyService";
import { FamilyMember, AddMemberFormProps } from "@/types/familyTypes";
import imageCompression from "browser-image-compression";
import { useToast } from "@/hooks/use-toast";
import ReactSelect from "react-select";

export default function AddMemberForm({
  onSubmit,
  onCancel,
  existingNodes,
  currentTreeName,
}: AddMemberFormProps) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [dob, setDob] = useState<string | null>(null);
  const [fatherId, setFatherId] = useState<string | null>(null);
  const [motherId, setMotherId] = useState<string | null>(null);
  const [partnerIds, setPartnerIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handlePartnerSelect = (selectedOptions: any) => {
    setPartnerIds(
      selectedOptions ? selectedOptions.map((option: any) => option.value) : []
    );
  };

  const showPermissionToast = () => {
    toast({
      title: "Insufficient permissions",
      description: "please, contact admin",
      variant: "destructive",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted");

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const newMember: FamilyMember = {
        id: "",
        name,
        gender,
        phone,
        dob,
        pids: partnerIds,
        fid: fatherId && fatherId !== "unassigned" ? [fatherId] : [],
        mid: motherId && motherId !== "unassigned" ? [motherId] : [],
        img: null,
        treename: currentTreeName,
      };

      const addedMember = await addFamilyMember(newMember, image);
      onSubmit(addedMember);
    } catch (error: any) {
      if (error.code === "permission-denied") {
        showPermissionToast();
      } else {
        console.error("Error adding/updating family member: ", error);
        toast({
          title: "Error",
          description: "Failed to add/update family member",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const imageHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (
      e &&
      e.target &&
      e.target &&
      e.target.files &&
      e.target.files.length > 0
    ) {
      const imageFile = e.target.files[0];
      const options = {
        maxSizeMB: 0.1,
        useWebWorker: true,
      };
      try {
        const compressedFile = await imageCompression(imageFile, options);
        console.log(compressedFile);
        setImage(compressedFile);
      } catch (error) {
        console.error("Error compressing image: ", error);
        toast({
          title: "Error",
          description: "Failed to compress image",
          variant: "destructive",
        });
      }
    } else {
      setImage(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="gender">Gender</Label>
        <Select onValueChange={setGender} value={gender}>
          <SelectTrigger>
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="phone">Phone No.</Label>
        <Input
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="dob">Date of Birth</Label>
        <Input
          id="dob"
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="image">Image</Label>
        <Input
          id="image"
          type="file"
          accept="image/*"
          onChange={imageHandler}
        />
      </div>
      <div>
        <Label htmlFor="fatherId">Father</Label>
        <Select onValueChange={setFatherId} value={fatherId || undefined}>
          <SelectTrigger>
            <SelectValue placeholder="Select father" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unassigned">None</SelectItem>
            {existingNodes
              .filter((node) => node.gender === "male")
              .map((node) => (
                <SelectItem key={node.id} value={node.id}>
                  {node.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="motherId">Mother</Label>
        <Select onValueChange={setMotherId} value={motherId || undefined}>
          <SelectTrigger>
            <SelectValue placeholder="Select mother" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unassigned">None</SelectItem>
            {existingNodes
              .filter((node) => node.gender === "female")
              .map((node) => (
                <SelectItem key={node.id} value={node.id}>
                  {node.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="partnerIds">Partners</Label>
        <ReactSelect
          isMulti
          name="partners"
          options={existingNodes.map((node) => ({
            value: node.id,
            label: node.name,
          }))}
          onChange={handlePartnerSelect}
        />
      </div>

      <div className="flex justify-between">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add Member"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
