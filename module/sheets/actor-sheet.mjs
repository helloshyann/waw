import {onManageActiveEffect, prepareActiveEffectCategories} from "../helpers/effects.mjs";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class WaWActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["waw", "sheet", "actor"],
      template: "systems/waw/templates/actor/actor-sheet.html",
      width: 720,
      height: 910,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "features" }]
    });
  }

  /** @override */
  get template() {
    return `systems/waw/templates/actor/actor-${this.actor.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = super.getData();

    // Use a safe clone of the actor data for further operations.
    const actorData = this.actor.toObject(false);

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actorData.system;
    context.flags = actorData.flags;

    // Prepare character data and items.
    if (actorData.type == 'character') {
      this._prepareItems(context);
      this._prepareCharacterData(context);

      context.hogwartsHouseOptions = {
      gryffindor: "Gryffindor",
      hufflepuff: "Hufflepuff",
      ravenclaw: "Ravenclaw",
      slytherin: "Slytherin"
    };

    context.casterTypeOptions = {
      intellect: "Intellect",
      technique: "Technique",
      willpower: "Willpower"
    };

    context.schoolOfMagicOptions = {
      lore: "Arcane Lore",
      duel: "Dueling Arts",
      enchant: "Enchanting Arts",
      magibio: "Magibology",
      mystic: "Mystic Arts",
      potions: "Potioneering",
      transfig: "Transmutation Sciences"
    };

    context.hogwartsHouse = actorData.system.attributes.hogwartsHouse.value;
    context.casterType = actorData.system.attributes.casterType.value;
    context.schoolOfMagic = actorData.system.attributes.schoolOfMagic.value;

    console.log("Hogwarts House Options:", context.hogwartsHouseOptions);
    console.log("Selected Hogwarts House:", context.hogwartsHouse);

    console.log("Caster Type Options:", context.casterTypeOptions);
    console.log("Selected Caster Type:", context.casterType);

    console.log("School of Magic Options:", context.schoolOfMagicOptions);
    console.log("Selected School of Magic:", context.schoolOfMagic);

    // Add a cssClass property based on the selected Hogwarts House
    context.cssClass = actorData.system.attributes.hogwartsHouse.value;

    // Retrieve the proficiency bonus
    const proficiencyBonus = actorData.system.attributes.profBonus.value ?? 2; // Default to 2 if not set

    // Update skills with ability modifiers and proficiency
    context.skills = Object.entries(actorData.system.skills).map(([key, skill]) => {
        // Get the modifier for the skill's associated ability
        const abilityMod = actorData.system.abilities[skill.ability]?.mod ?? 0;

        // Calculate the skill value
        // let skillValue = abilityMod;
        // if (skill.prof) {
        //     skillValue += proficiencyBonus; // Add proficiency bonus if proficient
        // }

        return {
            key: key,
            name: skill.name,
            ability: skill.ability,
            value: skill.value,
            // value: skillValue,
            prof: skill.prof,
            checked: skill.prof ? 'checked' : ''
        };
    }).filter(skill => skill.name); // Filter out any skills without a valid name
    
    console.log("Skills Data:", context.skills);
    console.log("Full context data:", context);

    // Level Log
    const level = this.actor.system.attributes.level.value;
    console.log("level, ", level);

    // Character Reputation Tracker
    console.log("Initial reputation entries:", actorData.system.attributes.reputation.entries);
      context.reputationValueOptions = {
      0: -5,
      1: -4,
      2: -3,
      3: -2,
      4: -1,
      5: 0,
      6: 1,
      7: 2,
      8: 3,
      9: 4,
      10: 5
      };

      context.reputationEntries = actorData.system.attributes.reputation.entries || [];
      console.log("Reputation Value Options:", context.reputationValueOptions);
      console.log("Reputation Entries:", context.reputationEntries);
    }

    // Prepare NPC data and items.
    if (actorData.type == 'npc') {
      this._prepareItems(context);
      this._prepareCharacterData(context);

      context.npcTypeOptions = {
      grystud: "Gryffindor Student",
      huffstud: "Hufflepuff Student",
      ravstud: "Ravenclaw Student",
      slystud: "Slytherin Student",
      professor: "Hogwarts Staff",
      shopkeeper: "Shopkeeper",
      magcitizen: "Magical Citizen",
      darkartist: "Dark Artist",
      camelot: "of Camelot",
      archmage: "Archmage",
      spirit: "Spirit",
      portrait: "Portrait",
      crusader: "Crusader",
      muggle: "Muggle",
      squib: "Squib"
      };

      context.npcType = actorData.system.attributes.npcType.value;
      console.log("NPC Type Options:", context.npcTypeOptions);
      console.log("Selected NPC Type:", context.npcType);

      // Add a cssClass property based on the selected Hogwarts House
      context.cssClass = actorData.system.attributes.npcType.value;

      // NPC Reputation Tracker
      console.log("Initial reputation entries:", actorData.system.attributes.reputation.entries);
      context.reputationValueOptions = {
      0: -5,
      1: -4,
      2: -3,
      3: -2,
      4: -1,
      5: 0,
      6: 1,
      7: 2,
      8: 3,
      9: 4,
      10: 5
      };

      context.reputationEntries = actorData.system.attributes.reputation.entries || [];
      console.log("Reputation Value Options:", context.reputationValueOptions);
      console.log("Reputation Entries:", context.reputationEntries);


    }

    // Prepare Monster data and items.
    if (actorData.type == 'monster') {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();

    // Prepare active effects
    context.effects = prepareActiveEffectCategories(this.actor.effects);


    return context;
  }

  
  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterData(context) {
    // Handle ability scores.
    for (let [k, v] of Object.entries(context.system.abilities)) {
      v.label = game.i18n.localize(CONFIG.WAW.abilities[k]) ?? k;
    }
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareItems(context) {
    // Initialize containers.
    const gear = [];
    const features = [];
    const spells = {
      "Initiate": [],
      "Adept": [],
      "Collegian": []
    };

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;
      // Append to gear.
      if (i.type === 'item') {
        gear.push(i);
      }
      // Append to features.
      else if (i.type === 'feature') {
        features.push(i);
      }
      // Append to spells.
      else if (i.type === 'spell') {
        if (i.system.spellLevel != undefined) {
          spells[i.system.spellLevel].push(i);
        }
      }
    }

    // Assign and return
    context.gear = gear;
    context.features = features;
    context.spells = spells;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Listeners for reputation
    html.find('.add-reputation').click(this._onAddReputationRow.bind(this));
    html.find('.reputation-name-input').change(event => this._onReputationNameChange(event));
    html.find('.reputation-value-radio').change(event => this._onReputationValueChange(event));
    html.find('.delete-reputation').click(event => this._onDeleteReputation(event));
    // Add listener for radio button changes and initial class updates
      this._updateReputationScaleClasses(html);
      html.find('.reputation-value-radio').change(event => {
        this._onReputationValueChange(event);
        this._updateReputationScaleClasses(html);
      });

    // Listeners for clubs
      html.find('.add-club').click(this._onAddClub.bind(this));
      html.find('.delete-club').click(this._onDeleteClub.bind(this));
      html.find('.club-name-input').change(this._onClubNameChange.bind(this));
      html.find('.club-skills-input').change(this._onClubSkillsChange.bind(this));
      html.find('.club-rank-input').change(this._onClubRankChange.bind(this));
      html.find('.club-xp-input').change(this._onClubXPChange.bind(this));

    // Listeners for part-time jobs
      html.find('.add-job').click(this._onAddJob.bind(this));
      html.find('.delete-job').click(this._onDeleteJob.bind(this));
      html.find('.job-workplace-input').change(this._onJobWorkplaceChange.bind(this));
      html.find('.job-title-input').change(this._onJobTitleChange.bind(this));
      html.find('.job-galleon-pay-input').change(this._onJobGalleonPayChange.bind(this));
      html.find('.job-sickle-pay-input').change(this._onJobSicklePayChange.bind(this));
      html.find('.job-knut-pay-input').change(this._onJobKnutPayChange.bind(this));

    // Add listener for the d20 roll
    html.find('.d20').click(event => this._onD20Roll(event));

    // Add listener for the d20 roll
    html.find('.wand-attack-container').click(event => this._onD20Roll(event));

    // Render the item sheet for viewing/editing prior to the editable check.
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Active Effect management
    html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.actor));

    // Rollable abilities.
    html.find('.rollable').click(this._onRoll.bind(this));

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = ev => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }

    // Add change event listeners for skill proficiency checkboxes and other inputs
    html.find('.skill [type="checkbox"]').on('change', event => this._onSkillProficiencyChange(event));
  }

/**
 * Handles changes to skill proficiency checkboxes, updating the actor's data.
 * @param {Event} event The change event.
 */
async _onSkillProficiencyChange(event) {
  const element = $(event.currentTarget);
  const skillKey = element.data('skill-key');
  const isChecked = element.is(':checked');

  // Prepare update data
  let updateData = {};
  updateData[`system.skills.${skillKey}.prof`] = isChecked;

  // Update the actor
  await this.object.update(updateData);
}

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system["type"];

    // Finally, create the item!
    return await Item.create(itemData, {parent: this.actor});
  }

  


async _onReputationNameChange(event) {
  const inputElement = $(event.currentTarget);
  const entryIndex = inputElement.data('entry-index'); // assuming each row has a data attribute like data-entry-index
  const newName = inputElement.val();

  const updatedEntries = this.actor.system.attributes.reputation.entries; //First get our list of reputation entries
  updatedEntries[entryIndex].characterName = newName; // The change 'name' property on the correect entry

  await this.actor.update({
    "system.attributes.reputation.entries": updatedEntries, // Finally, save the changes to the database
  })
}

async _onReputationValueChange(event) {
  const radioButton = $(event.currentTarget);
  const entryIndex = radioButton.data('entry-index');
  const newValue = Number.parseInt(radioButton.val(), 10);

  const updatedEntries = this.actor.system.attributes.reputation.entries; //First get our list of reputation entries
  updatedEntries[entryIndex].value = newValue; // The change 'name' property on the correect entry

  await this.actor.update({
    "system.attributes.reputation.entries": updatedEntries, // Finally, save the changes to the database
  })
}

async _onAddReputationRow(event) {
  event.preventDefault();

  // Retrieve current entries and check if it's an array
  let currentEntries = this.actor.system.attributes.reputation.entries;
  if (!Array.isArray(currentEntries)) {
    console.warn("currentEntries is not an array. Initializing as an empty array.");
    currentEntries = [];
  }

  // Add a new entry
  let newEntry = { characterName: 'New Character', value: 0 };
  currentEntries.push(newEntry);

  // Update the actor
  try {
    await this.actor.update({ 'system.attributes.reputation.entries': currentEntries });
    this.render(false);
  } catch (e) {
    console.error("Error updating actor:", e);
  }
}

async _onDeleteReputation(event) {
  event.preventDefault();
  const button = $(event.currentTarget);
  const entryIndex = button.data('entry-index');

  // Retrieve current entries
  let currentEntries = this.actor.system.attributes.reputation.entries;
  if (!Array.isArray(currentEntries)) {
    console.error("Error: currentEntries is not an array.");
    return;
  }

  // Remove the entry at the specified index
  currentEntries.splice(entryIndex, 1);

  // Update the actor
  try {
    await this.actor.update({ 'system.attributes.reputation.entries': currentEntries });
    this.render(false);
  } catch (e) {
    console.error("Error updating actor:", e);
  }
}

// Define a new function to update the reputation scale classes
  _updateReputationScaleClasses(html) {
    html.find('.reputation-value-radio').each(function() {
      const isChecked = $(this).is(':checked');
      if (isChecked) {
        $(this).closest('.reputation-scale').addClass('checked-class'); // Add your custom class
      } else {
        $(this).closest('.reputation-scale').removeClass('checked-class');
      }
    });
  }

async _onAddClub(event) {
  event.preventDefault();

  // Retrieve current entries and check if it's an array
  let clubEntries = this.actor.system.attributes.clubs.clubMemberships;
  if (!Array.isArray(clubEntries)) {
    console.warn("clubEntries is not an array. Initializing as an empty array.");
    clubEntries = [];
  }

  // Add a new entry
  let newEntry = { clubName: '', clubSkills: '', clubRank: '', clubXP: 0 };
  clubEntries.push(newEntry);

  // Update the actor
  try {
    await this.actor.update({ 'system.attributes.clubs.clubMemberships': clubEntries });
    this.render(false);
  } catch (e) {
    console.error("Error updating actor:", e);
  }
  
}


async _onDeleteClub(event) {
  event.preventDefault();
  const button = $(event.currentTarget);
  const entryIndex = button.data('entry-index');
  let clubMemberships = duplicate(this.actor.system.attributes.clubs.clubMemberships || []);
  clubMemberships.splice(entryIndex, 1);
  await this.actor.update({ 'system.attributes.clubs.clubMemberships': clubMemberships });
}

async _onClubNameChange(event) {
  const inputElement = $(event.currentTarget);
  const entryIndex = inputElement.data('entry-index');
  const newName = inputElement.val();

  const updatedMemberships = this.actor.system.attributes.clubs.clubMemberships;
  updatedMemberships[entryIndex].clubName = newName;

  await this.actor.update({
    'system.attributes.clubs.clubMemberships': updatedMemberships,
  });
}

async _onClubSkillsChange(event) {
  const inputElement = $(event.currentTarget);
  const entryIndex = inputElement.data('entry-index');
  const newSkills = inputElement.val();

  const updatedMemberships = this.actor.system.attributes.clubs.clubMemberships;
  updatedMemberships[entryIndex].clubSkills = newSkills;

  await this.actor.update({
    'system.attributes.clubs.clubMemberships': updatedMemberships,
  });
}

async _onClubRankChange(event) {
  const inputElement = $(event.currentTarget);
  const entryIndex = inputElement.data('entry-index');
  const newRank = inputElement.val();

  const updatedMemberships = this.actor.system.attributes.clubs.clubMemberships;
  updatedMemberships[entryIndex].clubRank = newRank;

  await this.actor.update({
    'system.attributes.clubs.clubMemberships': updatedMemberships,
  });
}

async _onClubXPChange(event) {
  const inputElement = $(event.currentTarget);
  const entryIndex = inputElement.data('entry-index');
  const newXP = parseInt(inputElement.val(), 10); // Assuming XP is a number

  const updatedMemberships = this.actor.system.attributes.clubs.clubMemberships;
  updatedMemberships[entryIndex].clubXP = newXP;

  await this.actor.update({
    'system.attributes.clubs.clubMemberships': updatedMemberships,
  });
}



async _onAddJob(event) {
  event.preventDefault();

  event.preventDefault();

  // Retrieve current entries and check if it's an array
  let jobEntries = this.actor.system.attributes.partTimeJobs.employedAt;
  if (!Array.isArray(jobEntries)) {
    console.warn("jobEntries is not an array. Initializing as an empty array.");
    jobEntries = [];
  }

  // Add a new entry
  let newEntry = { workplace: '', jobTitle: '', galleonPay: 0, sicklePay: 0, knutPay: 0 };
  jobEntries.push(newEntry);

  // Update the actor
  try {
    await this.actor.update({ 'system.attributes.partTimeJobs.employedAt': jobEntries });
    this.render(false);
  } catch (e) {
    console.error("Error updating actor:", e);
  }
}

async _onDeleteJob(event) {
  event.preventDefault();
  const button = $(event.currentTarget);
  const entryIndex = button.data('entry-index');
  let employedAt = duplicate(this.actor.system.attributes.partTimeJobs.employedAt || []);
  employedAt.splice(entryIndex, 1);
  await this.actor.update({ 'system.attributes.partTimeJobs.employedAt': employedAt });
}

async _onJobWorkplaceChange(event) {
    const inputElement = $(event.currentTarget);
    const entryIndex = inputElement.data('entry-index');
    const newWorkplace = inputElement.val();

    const updatedJobs = this.actor.system.attributes.partTimeJobs.employedAt;
    updatedJobs[entryIndex].workplace = newWorkplace;

    await this.actor.update({
        'system.attributes.partTimeJobs.employedAt': updatedJobs,
    });
}

async _onJobTitleChange(event) {
    const inputElement = $(event.currentTarget);
    const entryIndex = inputElement.data('entry-index');
    const newTitle = inputElement.val();

    const updatedJobs = this.actor.system.attributes.partTimeJobs.employedAt;
    updatedJobs[entryIndex].jobTitle = newTitle;

    await this.actor.update({
        'system.attributes.partTimeJobs.employedAt': updatedJobs,
    });
}

async _onJobGalleonPayChange(event) {
    const inputElement = $(event.currentTarget);
    const entryIndex = inputElement.data('entry-index');
    const newGalleonPay = parseInt(inputElement.val(), 10);

    const updatedJobs = this.actor.system.attributes.partTimeJobs.employedAt;
    updatedJobs[entryIndex].galleonPay = newGalleonPay;

    await this.actor.update({
        'system.attributes.partTimeJobs.employedAt': updatedJobs,
    });
}

async _onJobSicklePayChange(event) {
    const inputElement = $(event.currentTarget);
    const entryIndex = inputElement.data('entry-index');
    const newSicklePay = parseInt(inputElement.val(), 10);

    const updatedJobs = this.actor.system.attributes.partTimeJobs.employedAt;
    updatedJobs[entryIndex].sicklePay = newSicklePay;

    await this.actor.update({
        'system.attributes.partTimeJobs.employedAt': updatedJobs,
    });
}

async _onJobKnutPayChange(event) {
    const inputElement = $(event.currentTarget);
    const entryIndex = inputElement.data('entry-index');
    const newKnutPay = parseInt(inputElement.val(), 10);

    const updatedJobs = this.actor.system.attributes.partTimeJobs.employedAt;
    updatedJobs[entryIndex].knutPay = newKnutPay;

    await this.actor.update({
        'system.attributes.partTimeJobs.employedAt': updatedJobs,
    });
}


/**
 * Specifically handle d20 rolls from the sheet.
 * @param {Event} event The originating click event.
 */
async _onD20Roll(event) {
    event.preventDefault();
    const element = $(event.currentTarget);
    const rollFormula = element.data('roll');  // Expected to be "1d20"
    const rollLabel = element.data('label');   // Custom label from data attribute

    // Create the roll
    let roll = new Roll(rollFormula, this.actor.getRollData());

    // Evaluate the roll asynchronously
    await roll.evaluate({async: true});

    // Send the roll to the chat
    roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: rollLabel
    });
}




  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;



    // Handle item rolls.
    if (dataset.rollType) {
      if (dataset.rollType == 'item') {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      }
    }

    // Begin Skill Roll Code
    if (dataset.rollType === 'skill') {
      const skillKey = dataset.skillKey;
      const skill = this.actor.system.skills[skillKey];
      const abilityMod = this.actor.system.abilities[skill.ability].mod;

      // let total = abilityMod; // Start with the ability modifier

      // // Add proficiency bonus if the skill is proficient
      // if (skill.prof) {
      //   total += this.actor.system.attributes.profBonus.value;
      // }

      // Log the total for debugging
      console.log(`Total modifier for rolling ${skill.name}:`, skill.value);

      const rollFormula = `1d20 + ${skill.value}`;
      let roll = new Roll(rollFormula, this.actor.getRollData());
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: `Rolling ${skill.name}`,
        rollMode: game.settings.get('core', 'rollMode'),
      });
      return;
    }
    // End Skill Roll Code

    // Handle rolls that supply the formula directly.
      if (dataset.roll) {
        let label = dataset.label ? `[ability] ${dataset.label}` : '';
        let roll = new Roll(dataset.roll, this.actor.getRollData());
        roll.toMessage({
          speaker: ChatMessage.getSpeaker({ actor: this.actor }),
          flavor: label,
          rollMode: game.settings.get('core', 'rollMode'),
        });
        return roll;
      }




  }  

}