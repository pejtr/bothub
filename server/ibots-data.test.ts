import { describe, expect, it } from "vitest";

/**
 * Tests for iBots data integrity and Heritage Collection completeness.
 * These tests validate the client-side data files that power the landing page.
 */

// We import the data modules directly since they're pure TypeScript
// Note: These are client-side data files but contain no React/DOM dependencies
describe("iBots Data Integrity", () => {
  it("should have correct module structure for ibots data", async () => {
    // Dynamic import to handle client path resolution
    const ibotsModule = await import("../client/src/data/ibots");
    
    expect(ibotsModule.ibots).toBeDefined();
    expect(ibotsModule.categories).toBeDefined();
    expect(ibotsModule.getIBotsByCategory).toBeDefined();
    expect(ibotsModule.searchIBots).toBeDefined();
    expect(Array.isArray(ibotsModule.ibots)).toBe(true);
    expect(Array.isArray(ibotsModule.categories)).toBe(true);
  });

  it("should have exactly 77 iBots", async () => {
    const { ibots } = await import("../client/src/data/ibots");
    expect(ibots.length).toBe(77);
  });

  it("should have exactly 7 categories", async () => {
    const { categories } = await import("../client/src/data/ibots");
    expect(categories.length).toBe(7);
    
    const expectedCategoryIds = ["sales", "therapy", "leadership", "wealth", "spirituality", "health", "creativity"];
    const actualIds = categories.map((c: any) => c.id);
    expect(actualIds).toEqual(expect.arrayContaining(expectedCategoryIds));
  });

  it("every iBot should have required fields", async () => {
    const { ibots } = await import("../client/src/data/ibots");
    
    for (const bot of ibots) {
      expect(bot.id).toBeTruthy();
      expect(bot.name).toBeTruthy();
      expect(bot.category).toBeTruthy();
      expect(bot.categoryId).toBeTruthy();
      expect(bot.specialty).toBeTruthy();
      expect(bot.description).toBeTruthy();
      expect(bot.avatar).toBeTruthy();
      expect(Array.isArray(bot.tags)).toBe(true);
      expect(bot.tags.length).toBeGreaterThan(0);
    }
  });

  it("every iBot should belong to a valid category", async () => {
    const { ibots, categories } = await import("../client/src/data/ibots");
    const validCategoryIds = categories.map((c: any) => c.id);
    
    for (const bot of ibots) {
      expect(validCategoryIds).toContain(bot.categoryId);
    }
  });

  it("category counts should match actual bot counts", async () => {
    const { ibots, categories, getIBotsByCategory } = await import("../client/src/data/ibots");
    
    for (const category of categories) {
      const botsInCategory = getIBotsByCategory(category.id);
      expect(botsInCategory.length).toBe(category.count);
    }
  });

  it("search should return relevant results", async () => {
    const { searchIBots } = await import("../client/src/data/ibots");
    
    const results = searchIBots("Hormozi");
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((bot: any) => bot.name.includes("Hormozi"))).toBe(true);
  });

  it("all iBot IDs should be unique", async () => {
    const { ibots } = await import("../client/src/data/ibots");
    const ids = ibots.map((bot: any) => bot.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

describe("Heritage Collection - Red Dwarf Meltdown", () => {
  it("should have correct module structure", async () => {
    const heritageModule = await import("../client/src/data/heritage-collection");
    
    expect(heritageModule.heritageBots).toBeDefined();
    expect(heritageModule.heritageCategories).toBeDefined();
    expect(heritageModule.getHeroWorldBots).toBeDefined();
    expect(heritageModule.getVillainWorldBots).toBeDefined();
    expect(heritageModule.getHeritageBotById).toBeDefined();
  });

  it("should have exactly 2 categories (Heroworld and Villainworld)", async () => {
    const { heritageCategories } = await import("../client/src/data/heritage-collection");
    expect(heritageCategories.length).toBe(2);
    expect(heritageCategories[0].id).toBe("heroworld");
    expect(heritageCategories[1].id).toBe("villainworld");
  });

  it("should have 21 Heroworld bots matching Red Dwarf Meltdown", async () => {
    const { getHeroWorldBots } = await import("../client/src/data/heritage-collection");
    const heroes = getHeroWorldBots();
    expect(heroes.length).toBe(21);
    
    // Verify key characters from the episode
    const heroNames = heroes.map((h: any) => h.name);
    expect(heroNames).toContain("Elvis Presley");
    expect(heroNames).toContain("Albert Einstein");
    expect(heroNames).toContain("Mohandas Gandhi");
    expect(heroNames).toContain("Marilyn Monroe");
    expect(heroNames).toContain("Pythagoras");
    expect(heroNames).toContain("Abraham Lincoln");
    expect(heroNames).toContain("Matka Tereza");
    expect(heroNames).toContain("Dalajláma");
    expect(heroNames).toContain("Královna Viktorie");
  });

  it("should have 12 Villainworld bots matching Red Dwarf Meltdown", async () => {
    const { getVillainWorldBots } = await import("../client/src/data/heritage-collection");
    const villains = getVillainWorldBots();
    expect(villains.length).toBe(12);
    
    // Verify key characters from the episode
    const villainNames = villains.map((v: any) => v.name);
    expect(villainNames).toContain("Adolf Hitler");
    expect(villainNames).toContain("Caligula");
    expect(villainNames).toContain("Rasputin");
    expect(villainNames).toContain("Napoleon Bonaparte");
    expect(villainNames).toContain("Al Capone");
    expect(villainNames).toContain("James Last"); // The humorous inclusion
  });

  it("total Heritage Collection should have 33 bots", async () => {
    const { heritageBots } = await import("../client/src/data/heritage-collection");
    expect(heritageBots.length).toBe(33);
  });

  it("every Heritage bot should have required fields", async () => {
    const { heritageBots } = await import("../client/src/data/heritage-collection");
    
    for (const bot of heritageBots) {
      expect(bot.id).toBeTruthy();
      expect(bot.name).toBeTruthy();
      expect(bot.title).toBeTruthy();
      expect(bot.era).toBeTruthy();
      expect(["hero", "villain"]).toContain(bot.side);
      expect(bot.specialty).toBeTruthy();
      expect(bot.description).toBeTruthy();
      expect(bot.avatar).toBeTruthy();
      expect(bot.personality).toBeTruthy();
      expect(bot.samplePrompt).toBeTruthy();
      expect(Array.isArray(bot.tags)).toBe(true);
      expect(bot.tags.length).toBeGreaterThan(0);
    }
  });

  it("all Heritage bot IDs should be unique", async () => {
    const { heritageBots } = await import("../client/src/data/heritage-collection");
    const ids = heritageBots.map((bot: any) => bot.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("Heroworld IDs should start with 'hw-'", async () => {
    const { getHeroWorldBots } = await import("../client/src/data/heritage-collection");
    const heroes = getHeroWorldBots();
    for (const hero of heroes) {
      expect(hero.id.startsWith("hw-")).toBe(true);
    }
  });

  it("Villainworld IDs should start with 'vw-'", async () => {
    const { getVillainWorldBots } = await import("../client/src/data/heritage-collection");
    const villains = getVillainWorldBots();
    for (const villain of villains) {
      expect(villain.id.startsWith("vw-")).toBe(true);
    }
  });

  it("all villain descriptions should contain warning marker", async () => {
    const { getVillainWorldBots } = await import("../client/src/data/heritage-collection");
    const villains = getVillainWorldBots();
    for (const villain of villains) {
      expect(villain.description).toContain("DARK SIDE ADVISOR");
    }
  });

  it("getHeritageBotById should return correct bot", async () => {
    const { getHeritageBotById } = await import("../client/src/data/heritage-collection");
    
    const elvis = getHeritageBotById("hw-elvis");
    expect(elvis).toBeDefined();
    expect(elvis?.name).toBe("Elvis Presley");
    
    const hitler = getHeritageBotById("vw-hitler");
    expect(hitler).toBeDefined();
    expect(hitler?.name).toBe("Adolf Hitler");
    
    const nonExistent = getHeritageBotById("non-existent");
    expect(nonExistent).toBeUndefined();
  });
});
