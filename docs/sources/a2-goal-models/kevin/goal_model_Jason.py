"""17-626 HW2: Jason stakeholder goal model.
Source: Jason(2).csv. Goal IDs G-26 through G-49 continue Melissa's IDs.
GOAL_SOURCES indices refer to 1-based CSV data rows (excluding header).
Empty source indices indicate a modeling refinement/inference, not an interview quote.
"""
from goalmodeling.schema import (
    AchieveGoal, AvoidGoal, MaintainGoal, SoftGoal,
    Refinement, generate_graph, generate_pako_link,
)

GOAL_SOURCES = {
    'G-26': [2, 39, 42, 44],
    'G-27': [2, 4, 6, 8, 39, 44], 'G-28': [4, 8, 39],
    'G-29': [4, 8], 'G-30': [6, 8],
    'G-31': [8, 10, 12, 39], 'G-32': [10],
    'G-33': [10], 'G-34': [10],
    'G-35': [8],
    'G-36': [12, 15, 18, 21, 23, 25],
    'G-37': [15, 25], 'G-38': [15, 25],
    'G-39': [18, 25], 'G-40': [10, 12, 23],
    'G-41': [28, 30, 32, 34, 36],
    'G-42': [28, 30, 36], 'G-43': [30, 36],
    'G-44': [32, 34, 36], 'G-45': [34, 36],
    'G-46': [12, 39, 42, 44], 'G-47': [10, 12, 39],
    'G-48': [39, 42, 44], 'G-49': [],
}


def goal(cls, number, description, *, refinements=None, leaf=False):
    return cls(name=f'G-{number}: {description}', refinements=refinements, leaf=leaf)


# Direct school information: Jason needs notice without relying on Melissa.
G28 = goal(AchieveGoal, 28, 'School notices and event details delivered directly to Jason', leaf=True)
G29 = goal(AchieveGoal, 29, 'School event dates and details available for work planning', leaf=True)
G30 = goal(AchieveGoal, 30, 'School event information received early enough to adjust work if possible', leaf=True)
G27 = goal(AchieveGoal, 27, 'Stay informed and involved in children school activities', refinements=[
    Refinement(complete=True, children=[G28, G29, G30], annotation='H4')
])

# Requests must remain possible even when dispatch changes work unexpectedly.
G32 = goal(AchieveGoal, 32, 'Swap request includes dates and reason', leaf=True)
G33 = goal(AchieveGoal, 33, 'Clear accept or decline response recorded', leaf=True)
G34 = goal(AchieveGoal, 34, 'Swap request and final agreement retained as a record', leaf=True)
G35 = goal(AchieveGoal, 35, 'Short-notice swap request allowed if work route changes unexpectedly', leaf=True)
G49 = goal(AchieveGoal, 49, 'Request status remains visible while awaiting a decision', leaf=True)
G31 = goal(AchieveGoal, 31, 'Schedule swaps requested and resolved transparently', refinements=[
    Refinement(complete=True, children=[G32, G33, G34, G49], annotation='P1'),
    Refinement(complete=True, children=[G32, G33, G34, G35, G49], annotation='P4'),
])

# Unreliable connectivity requires distinguishing composition time from delivery time.
G37 = goal(AchieveGoal, 37, 'Time message was written recorded', leaf=True)
G38 = goal(AchieveGoal, 38, 'Time message was actually delivered recorded', leaf=True)
G39 = goal(AchieveGoal, 39, 'Message delivery and reply status visible to sender', leaf=True)
G40 = goal(MaintainGoal, 40, 'Original swap messages and responses preserved for review', leaf=True)
G36 = goal(AchieveGoal, 36, 'Reliable communication evidence available despite weak connectivity', refinements=[
    Refinement(complete=True, children=[G37, G38, G39, G40], annotation='H8')
])

# Child support and extra expenses must be distinguished, not offset against each other.
G42 = goal(AchieveGoal, 42, 'Extra child expense receipt and amount recorded', leaf=True)
G43 = goal(AchieveGoal, 43, 'Jason share and payment status tracked for each extra expense', leaf=True)
G44 = goal(MaintainGoal, 44, 'Child support payments kept separate from extra expenses', leaf=True)
G45 = goal(MaintainGoal, 45, 'State child support payment records remain distinct', leaf=True)
G41 = goal(AchieveGoal, 41, 'Child related financial obligations tracked accurately', refinements=[
    Refinement(complete=True, children=[G42, G43, G44, G45], annotation='H4')
])

# Stakeholder quality expectations.
G47 = goal(AvoidGoal, 47, 'Disputes caused by unanswered or unverified requests', leaf=True)
G48 = goal(SoftGoal, 48, 'Fair and accurate records support involvement without blame', leaf=True)
G46 = goal(SoftGoal, 46, 'Low conflict child focused co parenting communication', refinements=[
    Refinement(complete=True, children=[G47, G48], annotation='H6')
])
G26 = goal(AchieveGoal, 26, 'Jason remains involved through clear and accountable coordination', refinements=[
    Refinement(complete=True, children=[G27, G31, G36, G41, G46], annotation='H4')
])

ROOT_GOALS = [G26]
ALL_GOALS = {f'G-{i}': globals()[f'G{i}'] for i in range(26, 50)}

if __name__ == '__main__':
    diagram = generate_graph(ROOT_GOALS, [])
    link = generate_pako_link(diagram, 'edit', config={
        'theme': 'default', 'themeVariables': {'fontFamily': 'Helvetica'}
    })
    print('Jason goal model: 24 goals')
    print('Mermaid link:', link)
    with open('jason_mermaid.txt', 'w', encoding='utf-8') as output:
        output.write(link + '\n')
    with open('jason_diagram.mmd', 'w', encoding='utf-8') as output:
        output.write(diagram + '\n')
    print('Saved jason_mermaid.txt and jason_diagram.mmd')
