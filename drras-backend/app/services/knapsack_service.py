"""
Resource Allocation Engine - 0/1 Knapsack.

Given a finite supply (capacity) of one resource type (food / water /
medicine / ambulances) and a set of PENDING emergency requests each asking
for a certain amount of that resource, this picks the subset of requests
to FULLY serve that maximizes total "value" (priority_score) without
exceeding capacity. This is the textbook 0/1 knapsack: each request is
either fully allocated or not allocated at all (no partial shipments),
which mirrors real dispatch logistics (you don't send half an ambulance).

Complexity: O(n * capacity) time and space, standard DP table.
"""
from dataclasses import dataclass
from typing import List, Tuple


@dataclass
class KnapsackItem:
    request_id: int
    city: str
    weight: int   # quantity of the resource requested
    value: int    # priority_score used as the "value" to maximize


def solve_knapsack(items: List[KnapsackItem], capacity: int) -> Tuple[List[KnapsackItem], int, int]:
    """
    Returns (selected_items, total_value, capacity_used).
    Items with weight <= 0 or weight > capacity are skipped up front (can never fit).
    """
    items = [it for it in items if 0 < it.weight <= capacity]
    n = len(items)

    if n == 0 or capacity <= 0:
        return [], 0, 0

    # dp[i][w] = best total value using the first i items with capacity w
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]

    for i in range(1, n + 1):
        item = items[i - 1]
        for w in range(capacity + 1):
            dp[i][w] = dp[i - 1][w]
            if item.weight <= w:
                candidate = dp[i - 1][w - item.weight] + item.value
                if candidate > dp[i][w]:
                    dp[i][w] = candidate

    # Backtrack to find which items were kept
    selected: List[KnapsackItem] = []
    w = capacity
    for i in range(n, 0, -1):
        if dp[i][w] != dp[i - 1][w]:
            item = items[i - 1]
            selected.append(item)
            w -= item.weight

    selected.reverse()
    total_value = dp[n][capacity]
    capacity_used = sum(it.weight for it in selected)
    return selected, total_value, capacity_used
