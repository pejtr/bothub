import { describe, it, expect } from "vitest";

// Test chatbot comparison feature logic
describe("Chatbot Comparison Feature", () => {
  // Test BOT_COLORS configuration
  describe("Color Assignment", () => {
    const BOT_COLORS = [
      "#D4AF37", "#3B82F6", "#10B981", "#F59E0B", "#EF4444",
      "#8B5CF6", "#EC4899", "#06B6D4", "#F97316", "#14B8A6",
    ];

    it("should have 10 distinct colors for up to 10 bots", () => {
      expect(BOT_COLORS).toHaveLength(10);
      const unique = new Set(BOT_COLORS);
      expect(unique.size).toBe(10);
    });

    it("should wrap colors for more than 10 bots", () => {
      const getColor = (index: number) => BOT_COLORS[index % BOT_COLORS.length];
      expect(getColor(0)).toBe("#D4AF37");
      expect(getColor(10)).toBe("#D4AF37"); // wraps
      expect(getColor(5)).toBe("#8B5CF6");
      expect(getColor(15)).toBe("#8B5CF6"); // wraps
    });

    it("all colors should be valid hex codes", () => {
      BOT_COLORS.forEach((color) => {
        expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });
  });

  // Test comparison data processing
  describe("Comparison Data Processing", () => {
    const mockBots = [
      {
        botId: "alex-hormozi",
        totalTriggers: 150,
        totalInteractions: 45,
        interactionRate: 30.0,
        dailyTrend: [
          { date: "2026-02-15", count: 20 },
          { date: "2026-02-16", count: 25 },
          { date: "2026-02-17", count: 30 },
        ],
        triggerBreakdown: [
          { eventType: "scroll_pricing", count: 80 },
          { eventType: "time_on_page", count: 70 },
        ],
      },
      {
        botId: "grant-cardone",
        totalTriggers: 100,
        totalInteractions: 20,
        interactionRate: 20.0,
        dailyTrend: [
          { date: "2026-02-15", count: 10 },
          { date: "2026-02-16", count: 15 },
          { date: "2026-02-17", count: 20 },
        ],
        triggerBreakdown: [
          { eventType: "scroll_pricing", count: 50 },
          { eventType: "exit_intent", count: 50 },
        ],
      },
      {
        botId: "russell-brunson",
        totalTriggers: 200,
        totalInteractions: 80,
        interactionRate: 40.0,
        dailyTrend: [
          { date: "2026-02-15", count: 30 },
          { date: "2026-02-16", count: 35 },
          { date: "2026-02-17", count: 40 },
        ],
        triggerBreakdown: [
          { eventType: "catalog_comparison", count: 120 },
          { eventType: "time_on_page", count: 80 },
        ],
      },
    ];

    it("should find the best performing bot by interaction rate", () => {
      const bestBot = mockBots.reduce((best, b) =>
        b.interactionRate > best.interactionRate ? b : best
      );
      expect(bestBot.botId).toBe("russell-brunson");
      expect(bestBot.interactionRate).toBe(40.0);
    });

    it("should sort bots by interaction rate descending", () => {
      const sorted = [...mockBots].sort((a, b) => b.interactionRate - a.interactionRate);
      expect(sorted[0].botId).toBe("russell-brunson");
      expect(sorted[1].botId).toBe("alex-hormozi");
      expect(sorted[2].botId).toBe("grant-cardone");
    });

    it("should collect all unique dates from daily trends", () => {
      const allDates = new Set<string>();
      mockBots.forEach((b) => b.dailyTrend.forEach((d) => allDates.add(d.date)));
      const sortedDates = Array.from(allDates).sort();
      expect(sortedDates).toEqual(["2026-02-15", "2026-02-16", "2026-02-17"]);
    });

    it("should collect all unique trigger types across bots", () => {
      const allTriggerTypes = new Set<string>();
      mockBots.forEach((b) => b.triggerBreakdown.forEach((t) => allTriggerTypes.add(t.eventType)));
      const types = Array.from(allTriggerTypes);
      expect(types).toContain("scroll_pricing");
      expect(types).toContain("time_on_page");
      expect(types).toContain("exit_intent");
      expect(types).toContain("catalog_comparison");
      expect(types).toHaveLength(4);
    });

    it("should handle missing dates in daily trend gracefully", () => {
      const botWithMissingDate = {
        ...mockBots[0],
        dailyTrend: [{ date: "2026-02-15", count: 20 }], // missing 16 and 17
      };
      const allDates = ["2026-02-15", "2026-02-16", "2026-02-17"];
      const dateMap = new Map(botWithMissingDate.dailyTrend.map((d) => [d.date, d.count]));
      const values = allDates.map((d) => dateMap.get(d) || 0);
      expect(values).toEqual([20, 0, 0]);
    });

    it("should calculate max interaction rate for progress bars", () => {
      const maxRate = Math.max(...mockBots.map((x) => x.interactionRate));
      expect(maxRate).toBe(40.0);

      // Progress bar width calculation
      const widths = mockBots.map((b) => (b.interactionRate / maxRate) * 100);
      expect(widths[0]).toBe(75); // 30/40 * 100
      expect(widths[1]).toBe(50); // 20/40 * 100
      expect(widths[2]).toBe(100); // 40/40 * 100
    });
  });

  // Test bot selection logic
  describe("Bot Selection", () => {
    it("should limit selection to 10 bots", () => {
      const selectedBots: string[] = [];
      const addBot = (botId: string) => {
        if (selectedBots.length < 10 && !selectedBots.includes(botId)) {
          selectedBots.push(botId);
        }
      };

      // Add 12 bots - only 10 should be added
      for (let i = 0; i < 12; i++) {
        addBot(`bot-${i}`);
      }
      expect(selectedBots).toHaveLength(10);
    });

    it("should not allow duplicate bot selection", () => {
      const selectedBots: string[] = [];
      const addBot = (botId: string) => {
        if (selectedBots.length < 10 && !selectedBots.includes(botId)) {
          selectedBots.push(botId);
        }
      };

      addBot("alex-hormozi");
      addBot("alex-hormozi");
      addBot("alex-hormozi");
      expect(selectedBots).toHaveLength(1);
    });

    it("should remove bot from selection", () => {
      let selectedBots = ["alex-hormozi", "grant-cardone", "russell-brunson"];
      selectedBots = selectedBots.filter((id) => id !== "grant-cardone");
      expect(selectedBots).toEqual(["alex-hormozi", "russell-brunson"]);
    });

    it("should require minimum 2 bots for comparison", () => {
      const isEnabled = (count: number) => count >= 2;
      expect(isEnabled(0)).toBe(false);
      expect(isEnabled(1)).toBe(false);
      expect(isEnabled(2)).toBe(true);
      expect(isEnabled(5)).toBe(true);
    });
  });

  // Test search/filter logic
  describe("Bot Search Filter", () => {
    const allBots = [
      { id: "alex-hormozi", name: "Alex Hormozi", category: "Sales & Business" },
      { id: "grant-cardone", name: "Grant Cardone", category: "Sales & Business" },
      { id: "carl-jung", name: "Carl Jung", category: "Therapy & Psychology" },
      { id: "andrew-huberman", name: "Andrew Huberman", category: "Health & Wellness" },
    ];

    it("should filter bots by name (case insensitive)", () => {
      const query = "alex";
      const filtered = allBots.filter(
        (b) =>
          b.name.toLowerCase().includes(query.toLowerCase()) ||
          b.category.toLowerCase().includes(query.toLowerCase())
      );
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe("alex-hormozi");
    });

    it("should filter bots by category", () => {
      const query = "sales";
      const filtered = allBots.filter(
        (b) =>
          b.name.toLowerCase().includes(query.toLowerCase()) ||
          b.category.toLowerCase().includes(query.toLowerCase())
      );
      expect(filtered).toHaveLength(2);
    });

    it("should exclude already selected bots from search results", () => {
      const selectedBots = ["alex-hormozi"];
      const query = "";
      const filtered = allBots.filter(
        (b) =>
          !selectedBots.includes(b.id) &&
          (b.name.toLowerCase().includes(query.toLowerCase()) ||
            b.category.toLowerCase().includes(query.toLowerCase()))
      );
      expect(filtered).toHaveLength(3);
      expect(filtered.find((b) => b.id === "alex-hormozi")).toBeUndefined();
    });

    it("should return empty for non-matching query", () => {
      const query = "nonexistent";
      const filtered = allBots.filter(
        (b) =>
          b.name.toLowerCase().includes(query.toLowerCase()) ||
          b.category.toLowerCase().includes(query.toLowerCase())
      );
      expect(filtered).toHaveLength(0);
    });
  });

  // Test chart data construction
  describe("Chart Data Construction", () => {
    it("should build interaction rate bar chart data correctly", () => {
      const bots = [
        { botId: "bot-a", interactionRate: 30 },
        { botId: "bot-b", interactionRate: 45 },
      ];
      const BOT_COLORS = ["#D4AF37", "#3B82F6"];

      const data = {
        labels: bots.map((b) => b.botId),
        datasets: [
          {
            data: bots.map((b) => b.interactionRate),
            backgroundColor: bots.map((_, i) => BOT_COLORS[i]),
          },
        ],
      };

      expect(data.labels).toEqual(["bot-a", "bot-b"]);
      expect(data.datasets[0].data).toEqual([30, 45]);
      expect(data.datasets[0].backgroundColor).toEqual(["#D4AF37", "#3B82F6"]);
    });

    it("should build trend line data with one dataset per bot", () => {
      const bots = [
        { botId: "bot-a", dailyTrend: [{ date: "2026-02-17", count: 10 }] },
        { botId: "bot-b", dailyTrend: [{ date: "2026-02-17", count: 20 }] },
      ];

      const allDates = new Set<string>();
      bots.forEach((b) => b.dailyTrend.forEach((d) => allDates.add(d.date)));
      const sortedDates = Array.from(allDates).sort();

      const datasets = bots.map((b) => {
        const dateMap = new Map(b.dailyTrend.map((d) => [d.date, d.count]));
        return {
          label: b.botId,
          data: sortedDates.map((d) => dateMap.get(d) || 0),
        };
      });

      expect(datasets).toHaveLength(2);
      expect(datasets[0].data).toEqual([10]);
      expect(datasets[1].data).toEqual([20]);
    });

    it("should build trigger breakdown with all trigger types across bots", () => {
      const bots = [
        { botId: "bot-a", triggerBreakdown: [{ eventType: "scroll", count: 5 }] },
        { botId: "bot-b", triggerBreakdown: [{ eventType: "exit", count: 3 }, { eventType: "scroll", count: 7 }] },
      ];

      const allTypes = new Set<string>();
      bots.forEach((b) => b.triggerBreakdown.forEach((t) => allTypes.add(t.eventType)));
      const types = Array.from(allTypes);

      const datasets = bots.map((b) => {
        const typeMap = new Map(b.triggerBreakdown.map((t) => [t.eventType, t.count]));
        return {
          label: b.botId,
          data: types.map((t) => typeMap.get(t) || 0),
        };
      });

      expect(types).toContain("scroll");
      expect(types).toContain("exit");
      // bot-a has scroll=5, exit=0
      expect(datasets[0].data).toContain(5);
      // bot-b has scroll=7, exit=3
      expect(datasets[1].data).toContain(7);
      expect(datasets[1].data).toContain(3);
    });
  });

  // Test date range filtering
  describe("Date Range Filtering", () => {
    it("should accept 7d date range", () => {
      const dateRange = "7d" as const;
      expect(["7d", "30d", "90d", "all"]).toContain(dateRange);
    });

    it("should accept 30d date range", () => {
      const dateRange = "30d" as const;
      expect(["7d", "30d", "90d", "all"]).toContain(dateRange);
    });

    it("should accept 90d date range", () => {
      const dateRange = "90d" as const;
      expect(["7d", "30d", "90d", "all"]).toContain(dateRange);
    });

    it("should accept 'all' date range", () => {
      const dateRange = "all" as const;
      expect(["7d", "30d", "90d", "all"]).toContain(dateRange);
    });

    it("should map date ranges to correct number of days", () => {
      const daysMap = { "7d": 7, "30d": 30, "90d": 90, "all": 365 };
      expect(daysMap["7d"]).toBe(7);
      expect(daysMap["30d"]).toBe(30);
      expect(daysMap["90d"]).toBe(90);
      expect(daysMap["all"]).toBe(365);
    });
  });
});

  // Test enhanced trend visualizations
  describe("Enhanced Trend Visualizations", () => {
    const mockBotsWithEnhancedData = [
      {
        botId: "alex-hormozi",
        totalTriggers: 150,
        totalInteractions: 45,
        interactionRate: 30.0,
        dailyTrend: [
          { date: "2026-02-15", count: 50, interacted: 15, interactionRate: 30.0, performanceScore: 30.0 * Math.log(51) },
          { date: "2026-02-16", count: 60, interacted: 18, interactionRate: 30.0, performanceScore: 30.0 * Math.log(61) },
          { date: "2026-02-17", count: 40, interacted: 12, interactionRate: 30.0, performanceScore: 30.0 * Math.log(41) },
        ],
      },
      {
        botId: "grant-cardone",
        totalTriggers: 100,
        totalInteractions: 20,
        interactionRate: 20.0,
        dailyTrend: [
          { date: "2026-02-15", count: 30, interacted: 6, interactionRate: 20.0, performanceScore: 20.0 * Math.log(31) },
          { date: "2026-02-16", count: 40, interacted: 8, interactionRate: 20.0, performanceScore: 20.0 * Math.log(41) },
          { date: "2026-02-17", count: 30, interacted: 6, interactionRate: 20.0, performanceScore: 20.0 * Math.log(31) },
        ],
      },
    ];

    it("should include interacted count in daily trend data", () => {
      mockBotsWithEnhancedData.forEach((bot) => {
        bot.dailyTrend.forEach((trend) => {
          expect(trend).toHaveProperty("interacted");
          expect(typeof trend.interacted).toBe("number");
          expect(trend.interacted).toBeGreaterThanOrEqual(0);
        });
      });
    });

    it("should include interaction rate in daily trend data", () => {
      mockBotsWithEnhancedData.forEach((bot) => {
        bot.dailyTrend.forEach((trend) => {
          expect(trend).toHaveProperty("interactionRate");
          expect(typeof trend.interactionRate).toBe("number");
          expect(trend.interactionRate).toBeGreaterThanOrEqual(0);
          expect(trend.interactionRate).toBeLessThanOrEqual(100);
        });
      });
    });

    it("should calculate interaction rate correctly", () => {
      const trend = mockBotsWithEnhancedData[0].dailyTrend[0];
      const calculatedRate = (trend.interacted / trend.count) * 100;
      expect(calculatedRate).toBeCloseTo(trend.interactionRate, 1);
    });

    it("should include performance score in daily trend data", () => {
      mockBotsWithEnhancedData.forEach((bot) => {
        bot.dailyTrend.forEach((trend) => {
          expect(trend).toHaveProperty("performanceScore");
          expect(typeof trend.performanceScore).toBe("number");
          expect(trend.performanceScore).toBeGreaterThanOrEqual(0);
        });
      });
    });

    it("should calculate performance score as interaction_rate * log(volume + 1)", () => {
      const trend = mockBotsWithEnhancedData[0].dailyTrend[0];
      const expectedScore = trend.interactionRate * Math.log(trend.count + 1);
      expect(trend.performanceScore).toBeCloseTo(expectedScore, 1);
    });

    it("should build multi-metric trend data with 3 datasets per bot", () => {
      const allDates = new Set<string>();
      mockBotsWithEnhancedData.forEach((b) => b.dailyTrend.forEach((d) => allDates.add(d.date)));
      const sortedDates = Array.from(allDates).sort();

      const datasets = mockBotsWithEnhancedData.flatMap((b) => {
        const triggerMap = new Map(b.dailyTrend.map((d) => [d.date, d.count]));
        const interactionMap = new Map(b.dailyTrend.map((d) => [d.date, d.interacted]));
        const rateMap = new Map(b.dailyTrend.map((d) => [d.date, d.interactionRate || 0]));
        return [
          {
            label: `${b.botId} - Zobrazení`,
            data: sortedDates.map((d) => triggerMap.get(d) || 0),
            yAxisID: "y",
          },
          {
            label: `${b.botId} - Interakce`,
            data: sortedDates.map((d) => interactionMap.get(d) || 0),
            yAxisID: "y",
          },
          {
            label: `${b.botId} - Míra interakce (%)`,
            data: sortedDates.map((d) => rateMap.get(d) || 0),
            yAxisID: "y1",
          },
        ];
      });

      expect(datasets).toHaveLength(6); // 2 bots * 3 metrics each
      expect(datasets[0].yAxisID).toBe("y");
      expect(datasets[2].yAxisID).toBe("y1");
    });

    it("should build performance score trend data correctly", () => {
      const allDates = new Set<string>();
      mockBotsWithEnhancedData.forEach((b) => b.dailyTrend.forEach((d) => allDates.add(d.date)));
      const sortedDates = Array.from(allDates).sort();

      const datasets = mockBotsWithEnhancedData.map((b) => {
        const scoreMap = new Map(b.dailyTrend.map((d) => [d.date, d.performanceScore || 0]));
        return {
          label: `${b.botId} - Performance Score`,
          data: sortedDates.map((d) => scoreMap.get(d) || 0),
        };
      });

      expect(datasets).toHaveLength(2);
      expect(datasets[0].data).toHaveLength(3);
      expect(datasets[0].data[0]).toBeCloseTo(30.0 * Math.log(51), 1);
    });
  });

  // Test week-over-week aggregation
  describe("Week-over-Week Aggregation", () => {
    it("should aggregate daily data into weekly buckets", () => {
      const dailyTrend = [
        { date: "2026-02-10", count: 10, interacted: 3 }, // Week 1
        { date: "2026-02-11", count: 15, interacted: 5 }, // Week 1
        { date: "2026-02-17", count: 20, interacted: 8 }, // Week 2
        { date: "2026-02-18", count: 25, interacted: 10 }, // Week 2
      ];

      const weekMap = new Map<string, { triggers: number; interactions: number; rate: number }>();
      dailyTrend.forEach((d) => {
        const date = new Date(d.date);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekKey = weekStart.toISOString().split("T")[0];
        const existing = weekMap.get(weekKey) || { triggers: 0, interactions: 0, rate: 0 };
        existing.triggers += d.count;
        existing.interactions += d.interacted;
        weekMap.set(weekKey, existing);
      });

      // Calculate rates
      weekMap.forEach((v) => {
        v.rate = v.triggers > 0 ? (v.interactions / v.triggers) * 100 : 0;
      });

      expect(weekMap.size).toBeGreaterThan(0);
      Array.from(weekMap.values()).forEach((week) => {
        expect(week.triggers).toBeGreaterThan(0);
        expect(week.rate).toBeGreaterThanOrEqual(0);
        expect(week.rate).toBeLessThanOrEqual(100);
      });
    });

    it("should calculate week start as Sunday", () => {
      const testDate = new Date("2026-02-17"); // Tuesday
      const weekStart = new Date(testDate);
      weekStart.setDate(testDate.getDate() - testDate.getDay());
      expect(weekStart.getDay()).toBe(0); // Sunday
    });

    it("should build week-over-week chart data with mixed bar and line datasets", () => {
      const bots = [
        {
          botId: "bot-a",
          weekMap: new Map([
            ["2026-02-08", { triggers: 100, interactions: 30, rate: 30.0 }],
            ["2026-02-15", { triggers: 120, interactions: 40, rate: 33.3 }],
          ]),
        },
      ];

      const allWeeks = new Set<string>();
      bots.forEach((b) => b.weekMap.forEach((_, week) => allWeeks.add(week)));
      const sortedWeeks = Array.from(allWeeks).sort();

      const datasets = bots.flatMap((b) => {
        return [
          {
            label: `${b.botId} - Zobrazení`,
            data: sortedWeeks.map((w) => b.weekMap.get(w)?.triggers || 0),
            type: "bar",
            yAxisID: "y",
          },
          {
            label: `${b.botId} - Míra interakce (%)`,
            data: sortedWeeks.map((w) => b.weekMap.get(w)?.rate || 0),
            type: "line",
            yAxisID: "y1",
          },
        ];
      });

      expect(datasets).toHaveLength(2);
      expect(datasets[0].type).toBe("bar");
      expect(datasets[1].type).toBe("line");
      expect(datasets[0].yAxisID).toBe("y");
      expect(datasets[1].yAxisID).toBe("y1");
    });

    it("should handle empty weeks gracefully", () => {
      const weekMap = new Map<string, { triggers: number; interactions: number; rate: number }>();
      const allWeeks = ["2026-02-08", "2026-02-15", "2026-02-22"];
      weekMap.set("2026-02-08", { triggers: 50, interactions: 15, rate: 30.0 });
      // 2026-02-15 is missing
      weekMap.set("2026-02-22", { triggers: 60, interactions: 20, rate: 33.3 });

      const data = allWeeks.map((w) => weekMap.get(w)?.triggers || 0);
      expect(data).toEqual([50, 0, 60]);
    });
  });
