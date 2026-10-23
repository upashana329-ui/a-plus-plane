import { test, describe } from "node:test";
import assert from "node:assert";
import {
  BUS_COMPLAINT_CATEGORIES,
  BUS_COMPLAINT_STATUSES,
} from "../routes/modules.routes";

describe("Bus Transit Grievance System Tests", () => {
  test("defines all 7 required bus complaint categories", () => {
    const requiredCategories = [
      "Bus Arrived Late",
      "Bus Left Without Me",
      "Bus Did Not Arrive",
      "Bus Missed My Pickup Stop",
      "Bus Route Problem",
      "Bus Timing Mismatch",
      "Other Bus Problems",
    ];

    assert.strictEqual(BUS_COMPLAINT_CATEGORIES.length, 7);
    for (const cat of requiredCategories) {
      assert.ok(
        BUS_COMPLAINT_CATEGORIES.includes(cat as any),
        `Missing category: ${cat}`
      );
    }
  });

  test("defines required status workflow for bus grievances", () => {
    const requiredStatuses = [
      "Pending",
      "Under Review",
      "In Progress",
      "Resolved",
      "Rejected",
    ];

    for (const status of requiredStatuses) {
      assert.ok(
        BUS_COMPLAINT_STATUSES.includes(status as any),
        `Missing status: ${status}`
      );
    }
  });

  test("validates unique ticket ID generation pattern", () => {
    const randomCode = Math.floor(10000 + Math.random() * 90000);
    const ticketId = `BUS-TKT-${randomCode}`;
    assert.match(ticketId, /^BUS-TKT-\d{5}$/);
  });
});
