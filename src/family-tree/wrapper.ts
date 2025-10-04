import  FamilyTree  from '@/family-tree/family-tree.js';

export interface FamilyTreeProps {
  nodes: {
    [key: string]: any;
  }[];
}

FamilyTree.templates.atul = Object.assign({}, FamilyTree.templates.base);
FamilyTree.templates.atul.defs = `<style>
                                    .{randId} .bft-edit-form-header, .{randId} .bft-img-button{
                                        background-color: #aeaeae;
                                    }
                                    .{randId}.male .bft-edit-form-header, .{randId}.male .bft-img-button{
                                        background-color: #039BE5;
                                    }        
                                    .{randId}.male div.bft-img-button:hover{
                                        background-color: #F57C00;
                                    }
                                    .{randId}.female .bft-edit-form-header, .{randId}.female .bft-img-button{
                                        background-color: #F57C00;
                                    }        
                                    .{randId}.female div.bft-img-button:hover{
                                        background-color: #039BE5;
                                    }
                                </style>
                                <clipPath id="atul_img_0"><rect x="6" y="6" rx="54" ry="54" width="108" height="108"></rect></clipPath>
                                ${FamilyTree.gradientCircleForDefs('circle', '#aeaeae', 60, 5)}
                                ${FamilyTree.gradientCircleForDefs('male_circle', '#039BE5', 60, 5)}
                                ${FamilyTree.gradientCircleForDefs('female_circle', '#F57C00', 60, 5)}`;
FamilyTree.templates.atul.field_0 = 
    '<text ' + FamilyTree.attr.width + ' ="230" class="user_name" style="font-size: 16px;font-weight:bold;" fill="#aeaeae" x="60" y="145" text-anchor="middle">{val}</text>';
    // FamilyTree.templates.atul.field_0 = '<text style="font-size: 24px;" fill="#ffffff" x="100" y="90" text-anchor="middle">{val}</text>';

{/* <switch>
<foreignObject x="20" y="90" FamilyTree.attr.width="150" height="200">
<p xmlns="http://www.w3.org/1999/xhtml">Text goes here</p>
</foreignObject>

<text x="20" y="20">Your SVG viewer cannot display html.</text>
</switch> */}
// FamilyTree.templates.atul.field_0 = 
//     `
//     <switch>
//     <foreignObject x="60" y="135" width="230" height="50">
//     <p xmlns="http://www.w3.org/1999/xhtml" style="font-size: 16px;font-weight:bold;" fill="#aeaeae; te">{val}</p>
//     </foreignObject>

//     <text x="20" y="20">Your SVG viewer cannot display html.</text>
//     </switch>
// `;

{/* <text ' + FamilyTree.attr.width + ' ="230" style="font-size: 16px;font-weight:bold;" fill="#aeaeae" x="60" y="135" text-anchor="middle">{val}</text> */}
FamilyTree.templates.atul.field_0 = `
        <foreignObject x="-10" y="125" width="130" height="40">
            <div xmlns="http://www.w3.org/1999/xhtml" 
                style="background-color:#f0f0f0; 
                       text-align:center; 
                       font-size:13px; 
                       font-weight:bold; 
                       line-height:20px; 
                       white-space:wrap; 
                       overflow:hidden; 
                       text-overflow:ellipsis;">
                {val}
            </div>
        </foreignObject>
`;

// Small inline link button (field_4) - rendered as HTML inside foreignObject
FamilyTree.templates.atul.field_4 = `
    <foreignObject x="70" y="-10" width="40" height="40">
        <div xmlns="http://www.w3.org/1999/xhtml" style="display:flex;align-items:center;justify-content:center;">
            {val}
        </div>
    </foreignObject>
`;

FamilyTree.templates.atul.node = '<use x="0" y="0" xlink:href="#circle" />';
FamilyTree.templates.atul.img_0 = 
    '<image preserveAspectRatio="xMidYMid slice" clip-path="url(#atul_img_0)" xlink:href="{val}" x="6" y="6" width="108" height="108"></image>';
FamilyTree.templates.atul.ripple = {
    radius: 60,
    color: "#e6e6e6",
    rect: undefined
};

FamilyTree.templates.atul.size = [120, 120]
FamilyTree.templates.atul_male = Object.assign({}, FamilyTree.templates.atul);
FamilyTree.templates.atul_male.node += '<use x="0" y="0" xlink:href="#male_circle" />';
FamilyTree.templates.atul_male.ripple = {
    radius: 60,
    color: "#039BE5",
    rect: undefined
};
FamilyTree.templates.atul_female = Object.assign({}, FamilyTree.templates.atul);
FamilyTree.templates.atul_female.node += '<use x="0" y="0" xlink:href="#female_circle" />';
FamilyTree.templates.atul_female.ripple = {
    radius: 60,
    color: "#F57C00",
    rect: undefined
};
FamilyTree.templates.atul.nodeMenuButton = `<use ${FamilyTree.attr.control_node_menu_id}="{id}" x="90" y="50" xlink:href="#base_node_menu" />`;


export default FamilyTree