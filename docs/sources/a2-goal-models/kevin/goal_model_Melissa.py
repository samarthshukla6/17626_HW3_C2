"""17-626 HW2: Melissa stakeholder goal model.
Source: Melissa(2).csv. G-IDs are reserved for this model; renumber globally
when merging with Jason and Ruth. Refinement-derived goals are documented below.
"""
from goalmodeling.schema import (
    AchieveGoal, AvoidGoal, MaintainGoal, SoftGoal,
    Refinement, generate_graph, generate_pako_link,
)

# Each item is (goal ID, goal text, goal class, source CSV stakeholder row indices).
# Empty source list means a refinement/inference rather than an explicit interview claim.
GOAL_SOURCES = {
    'G-1': [2, 21, 31, 34], 'G-2': [2, 4, 6, 21, 31],
    'G-3': [2], 'G-4': [6], 'G-5': [6],
    'G-6': [4, 17, 21], 'G-7': [8, 10, 12, 34],
    'G-8': [8, 10], 'G-9': [10], 'G-10': [10, 12, 34],
    'G-11': [10, 25, 34], 'G-12': [14, 17, 19, 21, 31],
    'G-13': [14, 17, 19], 'G-14': [14, 19],
    'G-15': [17, 21, 31], 'G-16': [19],
    'G-17': [21], 'G-18': [17, 21, 31, 36],
    'G-19': [17, 19, 31], 'G-20': [21, 31],
    'G-21': [17, 21, 31, 36], 'G-22': [4, 6],
    'G-23': [25], 'G-24': [6, 19], 'G-25': [10, 12, 34],
}

def goal(cls, number, description, *, refinements=None, leaf=False):
    return cls(name=f'G-{number}: {description}', refinements=refinements, leaf=leaf)

# Schedule-related leaves
G3 = goal(AchieveGoal, 3, 'Parenting plan and current schedule available', leaf=True)
G4 = goal(AchieveGoal, 4, 'Schedule change notice recorded at least 48 hours in advance', leaf=True)
G5 = goal(AchieveGoal, 5, 'Late change considered if it works for children', leaf=True)
G22 = goal(MaintainGoal, 22, 'Written confirmation of schedule changes', leaf=True)
G23 = goal(AchieveGoal, 23, 'Notice time and affected event linked', leaf=True)
G6 = goal(AchieveGoal, 6, 'Pickup and drop-off changes reflected in calendar and shared with children', leaf=True)
G24 = goal(AchieveGoal, 24, 'Schedule-change decision recorded', leaf=True)

# OR refinement: normal-notice path or last-minute path
G2 = goal(AchieveGoal, 2, 'Parenting schedule coordinated clearly', refinements=[
    Refinement(complete=True, children=[G3, G4, G22, G23, G6], annotation='P2'),
    Refinement(complete=True, children=[G3, G5, G22, G24, G6], annotation='P4'),
])

# Pickup audit trail
G9 = goal(AchieveGoal, 9, 'Scheduled time, check-in time, location and pickup outcome recorded', leaf=True)
G8 = goal(AchieveGoal, 8, 'Completed, refused and missed pickups documented', refinements=[
    Refinement(complete=True, children=[G9], annotation='H4')
])
G10 = goal(MaintainGoal, 10, 'Original entries and correction history preserved', leaf=True)
G11 = goal(AchieveGoal, 11, 'Original messages, timestamps and related notices preserved', leaf=True)
G25 = goal(SoftGoal, 25, 'Pickup evidence remains credible for later review', leaf=True)
G7 = goal(AchieveGoal, 7, 'Reliable immutable pickup audit trail available', refinements=[
    Refinement(complete=True, children=[G8, G10, G11, G25], annotation='H4')
])

# Expense management
G13 = goal(AchieveGoal, 13, 'Expense receipts attached with provider, date and amount', leaf=True)
G14 = goal(MaintainGoal, 14, 'Medical and school expenses split 50-50 under parenting order', leaf=True)
G15 = goal(AchieveGoal, 15, 'Payment confirmation matched to expense and receipt', leaf=True)
G16 = goal(AchieveGoal, 16, 'Disputed charges reviewed against parenting plan in writing', leaf=True)
G12 = goal(AchieveGoal, 12, 'Child-related expenses tracked and classified correctly', refinements=[
    Refinement(complete=True, children=[G13, G14, G15, G16], annotation='H4')
])

# Communication and quality goals
G19 = goal(MaintainGoal, 19, 'Parent communication about disagreements remains in writing', leaf=True)
G20 = goal(AchieveGoal, 20, 'Schedule, messages, receipts and payments organized in one place', leaf=True)
G21 = goal(AvoidGoal, 21, 'Children used as messengers or exposed to parental disputes', leaf=True)
G18 = goal(SoftGoal, 18, 'Child-focused low-conflict communication supported', refinements=[
    Refinement(complete=True, children=[G19, G21], annotation='H6')
])
G17 = goal(SoftGoal, 17, 'Coordination effort and contradictory records minimized', refinements=[
    Refinement(complete=True, children=[G20], annotation='H6')
])

G1 = goal(AchieveGoal, 1, 'Clear accountable co-parenting coordination', refinements=[
    Refinement(complete=True, children=[G2, G7, G12, G17, G18], annotation='H4')
])

ROOT_GOALS = [G1]
ALL_GOALS = {f'G-{i}': globals()[f'G{i}'] for i in range(1, 26)}

if __name__ == '__main__':
    diagram = generate_graph(ROOT_GOALS, [])
    link = generate_pako_link(diagram, 'edit', config={
        'theme': 'default', 'themeVariables': {'fontFamily': 'Helvetica'}
    })
    print('Melissa goal model: 25 goals')
    print('Mermaid link:', link)
    with open('melissa_mermaid.txt', 'w', encoding='utf-8') as output:
        output.write(link + '\n')
    with open('melissa_diagram.mmd', 'w', encoding='utf-8') as output:
        output.write(diagram + '\n')
    print('Saved melissa_mermaid.txt and melissa_diagram.mmd')
