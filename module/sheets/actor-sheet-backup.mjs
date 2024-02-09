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
      width: 600,
      height: 975,
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
      charms: "Charms",
      divination: "Divination",
      jhc: "Jinxes, Hexes, & Curses",
      healing: "Healing",
      magizoo: "Magizoology",
      transfig: "Transfiguration"
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
        let skillValue = abilityMod;
        if (skill.prof) {
            skillValue += proficiencyBonus; // Add proficiency bonus if proficient
        }

        return {
            key: key,
            name: skill.name,
            ability: skill.ability,
            value: skillValue,
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
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
      8: [],
      9: []
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

    // Bind the add reputation row function
    html.find('.add-reputation').click(this._onAddReputationRow.bind(this));

    // Listener for reputation name input changes
  html.find('.reputation-name-input').change(event => this._onReputationNameChange(event));

  // Listener for reputation value radio button changes
  html.find('.reputation-value-radio').change(event => this._onReputationValueChange(event));

  // Listener for delete reputation button
  html.find('.delete-reputation').click(event => this._onDeleteReputation(event));

  // Add listener for radio button changes and initial class updates
    this._updateReputationScaleClasses(html);
    html.find('.reputation-value-radio').change(event => {
      this._onReputationValueChange(event);
      this._updateReputationScaleClasses(html);
    });


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

      let total = abilityMod; // Start with the ability modifier

      // Add proficiency bonus if the skill is proficient
      if (skill.prof) {
        total += this.actor.system.attributes.profBonus.value;
      }

      // Log the total for debugging
      console.log(`Total modifier for rolling ${skill.name}:`, total);

      const rollFormula = `1d20 + ${total}`;
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


