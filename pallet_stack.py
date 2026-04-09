import math

MAX_BOXES = 16
WALL = 12
BOTTOM_HALF_MIN = 15
MIN_TOP = 4


def label(n):
    if n == MAX_BOXES:
        return "filled"
    if n >= WALL:
        return "wall formed"
    if n > 4:
        return "partial"
    return "weak"


def valid(floors):
    if not floors or floors[-1] < MIN_TOP:
        return False
    if len(floors) <= 3:
        return floors[0] >= WALL
    return all(a >= b for a, b in zip(floors, floors[1:])) and all(
        x >= BOTTOM_HALF_MIN for x in floors[: len(floors) // 2]
    )


def better(a, b):
    if b is None:
        return True
    if a[-1] != b[-1]:
        return a[-1] > b[-1]
    if len(a) != len(b):
        return len(a) < len(b)
    if len(a) <= 3 and a[0] != b[0]:
        return a[0] < b[0]
    return a > b


def best_stack(total):
    if total <= 0:
        return []

    best = None

    def search(left, floors, count):
        nonlocal best
        need = count - len(floors)
        if need == 0:
            if left == 0 and valid(floors) and better(floors, best):
                best = floors[:]
            return
        if left < need or left > need * MAX_BOXES:
            return

        low = max(1, left - (need - 1) * MAX_BOXES)
        high = min(MAX_BOXES, left - (need - 1))

        if count <= 3:
            if not floors:
                low = max(low, WALL)
            elif len(floors) == 1 and floors[0] == WALL:
                high = MAX_BOXES
        elif floors:
            high = min(high, floors[-1])

        for boxes in range(high, low - 1, -1):
            floors.append(boxes)
            search(left - boxes, floors, count)
            floors.pop()

    for count in range(math.ceil(total / MAX_BOXES), total + 1):
        search(total, [], count)
        if best:
            return best
    return []


def print_plan(total):
    floors = best_stack(total)
    if not floors:
        print("No valid stack found.")
        return

    ordered = sorted(floors, reverse=True)
    print(f"Total boxes: {total}")
    print(f"Floors: {len(floors)}")
    print(f"Plan most->least: {ordered}")
    print(f"Top floor boxes: {floors[-1]}\n")
    for i, boxes in enumerate(ordered, 1):
        print(f"Floor {i}: {boxes} boxes ({label(boxes)})")


def main():
    print("Pallet stacking planner")
    print("Type a box count and press Enter.")
    print("Type q to quit.\n")

    while True:
        raw = input("Enter total number of boxes: ").strip().lower()
        if raw in {"q", "quit", "exit"}:
            print("Goodbye.")
            return
        if not raw:
            print("Please enter a number.\n")
            continue
        try:
            total = int(raw)
        except ValueError:
            print("Invalid input. Please enter a whole number.\n")
            continue
        print()
        print_plan(total)
        print()


if __name__ == "__main__":
    main()
