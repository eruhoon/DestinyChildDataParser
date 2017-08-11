
export type GFDollIcon = string;
export type GFType = 'SMG' | 'RF' | 'AR' | 'SG' | 'HG' | 'MG';
export type GFCostume = { name: string, image: string };

export type GFDollInfo = {
	//id: number,
	name: string,
	icon: GFDollIcon,
	//costumes: Array<GFCostume>
	link: string,
	rarity: string,
	type: GFType,
	/*time: number,
	story: string,
	skins: Array<GFDollSkin>,
	stat: {
		power: number, hp: number, attack: number,
		defense: number, agility: number, critical: number
	},
	skill: {
		base: GFDollSkill,
		normal: GFDollSkill,
		slide: GFDollSkill,
		drive: GFDollSkill,
		leader: GFDollSkill
	}*/
};