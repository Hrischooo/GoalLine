const FORMATION_SLOT_LAYOUTS = {
  '4-3-3': {
    gk: { x: 50, y: 89 },
    lb: { x: 16, y: 73 },
    lcb: { x: 38, y: 76 },
    rcb: { x: 62, y: 76 },
    rb: { x: 84, y: 73 },
    dm: { x: 50, y: 58 },
    lcm: { x: 34, y: 46 },
    rcm: { x: 66, y: 46 },
    lw: { x: 16, y: 24 },
    st: { x: 50, y: 16 },
    rw: { x: 84, y: 24 }
  },
  '4-2-3-1': {
    gk: { x: 50, y: 89 },
    lb: { x: 16, y: 73 },
    lcb: { x: 38, y: 76 },
    rcb: { x: 62, y: 76 },
    rb: { x: 84, y: 73 },
    ldm: { x: 39, y: 58 },
    rdm: { x: 61, y: 58 },
    cam: { x: 50, y: 40 },
    lw: { x: 17, y: 31 },
    rw: { x: 83, y: 31 },
    st: { x: 50, y: 16 }
  },
  '4-4-2': {
    gk: { x: 50, y: 89 },
    lb: { x: 16, y: 73 },
    lcb: { x: 38, y: 76 },
    rcb: { x: 62, y: 76 },
    rb: { x: 84, y: 73 },
    lm: { x: 16, y: 46 },
    lcm: { x: 38, y: 47 },
    rcm: { x: 62, y: 47 },
    rm: { x: 84, y: 46 },
    lst: { x: 40, y: 18 },
    rst: { x: 60, y: 18 }
  },
  '3-5-2': {
    gk: { x: 50, y: 89 },
    lcb: { x: 27, y: 76 },
    cb: { x: 50, y: 79 },
    rcb: { x: 73, y: 76 },
    lwb: { x: 12, y: 49 },
    ldm: { x: 36, y: 49 },
    cm: { x: 50, y: 39 },
    rdm: { x: 64, y: 49 },
    rwb: { x: 88, y: 49 },
    lst: { x: 40, y: 18 },
    rst: { x: 60, y: 18 }
  },
  '3-4-3': {
    gk: { x: 50, y: 89 },
    lcb: { x: 27, y: 76 },
    cb: { x: 50, y: 79 },
    rcb: { x: 73, y: 76 },
    lwb: { x: 14, y: 48 },
    lcm: { x: 40, y: 47 },
    rcm: { x: 60, y: 47 },
    rwb: { x: 86, y: 48 },
    lw: { x: 18, y: 22 },
    st: { x: 50, y: 16 },
    rw: { x: 82, y: 22 }
  },
  '4-1-4-1': {
    gk: { x: 50, y: 89 },
    lb: { x: 16, y: 73 },
    lcb: { x: 38, y: 76 },
    rcb: { x: 62, y: 76 },
    rb: { x: 84, y: 73 },
    dm: { x: 50, y: 58 },
    lm: { x: 16, y: 37 },
    lcm: { x: 39, y: 43 },
    rcm: { x: 61, y: 43 },
    rm: { x: 84, y: 37 },
    st: { x: 50, y: 16 }
  },
  '4-1-2-1-2': {
    gk: { x: 50, y: 89 },
    lb: { x: 16, y: 73 },
    lcb: { x: 38, y: 76 },
    rcb: { x: 62, y: 76 },
    rb: { x: 84, y: 73 },
    dm: { x: 50, y: 58 },
    lcm: { x: 37, y: 45 },
    rcm: { x: 63, y: 45 },
    cam: { x: 50, y: 31 },
    lst: { x: 40, y: 18 },
    rst: { x: 60, y: 18 }
  },
  '5-3-2': {
    gk: { x: 50, y: 89 },
    lwb: { x: 11, y: 63 },
    lcb: { x: 29, y: 75 },
    cb: { x: 50, y: 79 },
    rcb: { x: 71, y: 75 },
    rwb: { x: 89, y: 63 },
    dm: { x: 50, y: 55 },
    lcm: { x: 36, y: 43 },
    rcm: { x: 64, y: 43 },
    lst: { x: 40, y: 18 },
    rst: { x: 60, y: 18 }
  },
  '5-2-3': {
    gk: { x: 50, y: 89 },
    lwb: { x: 11, y: 63 },
    lcb: { x: 29, y: 75 },
    cb: { x: 50, y: 79 },
    rcb: { x: 71, y: 75 },
    rwb: { x: 89, y: 63 },
    lcm: { x: 38, y: 45 },
    rcm: { x: 62, y: 45 },
    lw: { x: 18, y: 22 },
    st: { x: 50, y: 16 },
    rw: { x: 82, y: 22 }
  }
};

const LINE_Y = {
  attack: 22,
  midfield: 48,
  defense: 75,
  goalkeeper: 89
};

function groupSlotsByLine(slots = []) {
  return slots.reduce((groups, slot) => {
    const lineKey = slot.line || 'midfield';
    groups[lineKey] = groups[lineKey] || [];
    groups[lineKey].push(slot);
    return groups;
  }, {});
}

function sortLineSlots(slots = []) {
  return [...slots].sort((left, right) => String(left.slotId || left.slotLabel || '').localeCompare(String(right.slotId || right.slotLabel || '')));
}

function buildFallbackLayout(slots = []) {
  const grouped = groupSlotsByLine(slots);

  return Object.values(grouped).flatMap((lineSlots) => {
    const sortedSlots = sortLineSlots(lineSlots);
    const count = sortedSlots.length;
    const gap = count <= 1 ? 0 : 70 / (count - 1);
    const startX = count <= 1 ? 50 : 15;

    return sortedSlots.map((slot, index) => ({
      slotId: slot.slotId,
      x: count <= 1 ? 50 : startX + gap * index,
      y: LINE_Y[slot.line] || 50
    }));
  });
}

export function getFormationSlotLayout(formation, slots = []) {
  const mappedLayout = FORMATION_SLOT_LAYOUTS[formation] || {};
  const fallbackLayout = buildFallbackLayout(slots);
  const fallbackMap = Object.fromEntries(fallbackLayout.map((item) => [item.slotId, item]));

  return slots.map((slot) => ({
    ...slot,
    x: mappedLayout[slot.slotId]?.x ?? fallbackMap[slot.slotId]?.x ?? 50,
    y: mappedLayout[slot.slotId]?.y ?? fallbackMap[slot.slotId]?.y ?? 50
  }));
}

export { FORMATION_SLOT_LAYOUTS };
