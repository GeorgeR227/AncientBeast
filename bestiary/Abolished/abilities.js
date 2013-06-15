/*
*
*	Abolished abilities
*
*/
abilities[7] =[

// 	First Ability: Greater Pyre
{
	//	Type : Can be "onQuery","onStartPhase","onDamage"
	trigger : "onDamage oncePerDamageChain",

	damages : {
		burn : 10
	},

	triggeredThisChain : false,

	// 	require() :
	require : function(damage){
		if( !this.testRequirements() ) return false;
		if( this.triggeredThisChain ) return false
		if(damage == undefined) damage = {type:"target"}; //For the test function to work
		if( this.dmgIsType("retaliation",damage) ) return false;
		return true;
	},

	//	activate() : 
	activate : function(damage) {
		var targets = this.getTargets(this.creature.adjacentHexs(1));
		this.end();
		
		this.areaDamage(
			this.creature, //Attacker
			"area retaliation", //Attack Type
			this.damages, //Damage Type
			[],	//Effects
			targets
		);

		this.triggeredThisChain = true;

		return damage;
	},
},


// 	Second Ability: Fiery Claw
{
	//	Type : Can be "onQuery","onStartPhase","onDamage"
	trigger : "onQuery",

	damages : {
		slash : 10,
		burn : 10
	},

	distance : 2,

	// 	require() :
	require : function(){
		if( !this.testRequirements() ) return false;
		var test = this.testDirection({
			team : "ennemy",
			distance : this.distance,
			sourceCreature : this.creature,
		});
		if( !test ){
			this.message = G.msg.abilities.notarget;
			return false;
		}
		return true;
	},

	// 	query() :
	query : function(){
		var ability = this;
		var crea = this.creature;

		G.grid.queryDirection({
			fnOnConfirm : ability.activate, //fnOnConfirm
			flipped : crea.player.flipped,
			team : 0, //enemies
			id : this.creature.id,
			requireCreature : true,
			x : crea.x,
			y : crea.y,
			args : {creature:crea, ability: ability},
			distance : this.distance,
			sourceCreature : crea,
		});
	},


	//	activate() : 
	activate : function(path,args) {
		var ability = args.ability;
		ability.end();

		var target = path.last().creature;

		var damage = new Damage(
			args.creature, //Attacker
			"target", //Attack Type
			ability.damages, //Damage Type
			1, //Area
			[]	//Effects
		);
		target.takeDamage(damage);
	},
},



// 	Thirt Ability: Burning Eye
{
	//	Type : Can be "onQuery","onStartPhase","onDamage"
	trigger : "onQuery",

	// 	require() :
	require : function(){
		return this.testRequirements();
	},

	// 	query() :
	query : function(){
		var ability = this;
		var crea = this.creature;

		crea.queryMove({
			noPath : true,
			isAbility : true,
			range : G.grid.getFlyingRange(crea.x,crea.y,50,crea.size,crea.id),
			callback : this.activate,
			args : {creature:crea, ability: ability},
		});
	},


	//	activate() : 
	activate : function(hex,args) {
		var ability = args.args.ability;
		ability.end();

		args.creature.moveTo(hex,{
			ignoreMovementPoint : true,
			ignorePath : true,
			animation : "teleport",
			callback : function(){ 
				G.activeCreature.queryMove() 
			}
		}); 
	},
},



// 	Fourth Ability: Fire Ball
{
	//	Type : Can be "onQuery","onStartPhase","onDamage"
	trigger : "onQuery",

	damages : {
		burn : 20,
	},

	damages2 : {
		burn : 10,
	},

	// 	require() :
	require : function(){
		return this.testRequirements();
	},

	// 	query() :
	query : function(){
		var ability = this;
		var crea = this.creature;

		var range = crea.hexagons[1].adjacentHex(3);

		var head = range.indexOf(crea.hexagons[0]);
		var tail = range.indexOf(crea.hexagons[2]);
		range.splice(head,1);
		range.splice(tail,1);

		G.grid.queryHexs({
			fnOnConfirm : ability.activate, //fnOnConfirm
			fnOnSelect : function(hex,args){
				if( hex.creature instanceof Creature ){
					hex.overlayVisualState("creature selected player"+hex.creature.team);
				}else{
					hex.overlayVisualState("creature selected player"+G.activeCreature.team);
				}				

				hex.adjacentHex(1).each(function(){
					if( this.creature instanceof Creature ){
						this.overlayVisualState("creature selected weakDmg player"+this.creature.team);
					}else{
						this.overlayVisualState("creature selected weakDmg player"+G.activeCreature.team);
					}
				});
			},
			id : this.creature.id,
			args : {creature:crea, ability: ability},
			hexs : range,
		});
	},


	//	activate() : 
	activate : function(hex,args) {
		var ability = args.ability;
		ability.end();
		
		var aoe = hex.adjacentHex(1);

		var targets = ability.getTargets(aoe);

		if(hex.creature instanceof Creature){
			hex.creature.takeDamage(new Damage(
				args.creature, //Attacker
				"area", //Attack Type
				ability.damages, //Damage Type
				1, //Area
				[]	//Effects
			));
		}


		ability.areaDamage(
			args.creature,
			"area",
			ability.damages2,
			[],	//Effects
			targets
		);

	},
}

];