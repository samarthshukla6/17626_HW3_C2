"""17-626 HW2: integrated goal model retaining every non-merged source goal.
The three stakeholder hierarchies are preserved, with duplicate leaf goals
consolidated under MERGED_GOALS and their details retained in the representative.
"""
from goalmodeling.schema import (AchieveGoal, AvoidGoal, MaintainGoal, SoftGoal,
    Refinement, ConflictLink, generate_graph, generate_pako_link)
import goal_model_Melissa as m
import goal_model_Jason as j
import goal_model_Ruth as r

MERGED_GOALS = {'G-34': 'G-22', 'G-40': 'G-11', 'G-42': 'G-13', 'G-48': 'G-25', 'G-53': 'G-10', 'G-54': 'G-38', 'G-71': 'G-39', 'G-79': 'G-25'}
# The extra details below preserve requirements from the removed duplicate IDs.
MERGED_DETAILS = {'G-22': ' (including swap request and final agreement)', 'G-11': ' (including original swap messages and responses)', 'G-13': ' (including extra child expense receipts and amounts)', 'G-25': ' (including neutral, fair and accurate case records)', 'G-10': ' (append-only originals, edits and deletion events)', 'G-38': ' (trusted server delivery timestamps, distinguished from sent and read events)', 'G-39': ' (including server-recorded sent, delivered and opened states)'}

# Rebuild each stakeholder hierarchy without duplicate IDs. Keeping its parent
# goal preserves why/how relationships and all unmerged intermediate goals.
def retain(goal):
    match = __import__('re').match(r'^(G-\d+): (.*)$', goal.name)
    goal_id = match.group(1) if match else None
    if goal_id in MERGED_GOALS:
        return None
    name = goal.name + MERGED_DETAILS.get(goal_id, '')
    refinements = []
    for refinement in (getattr(goal, 'disjunctions', None) or []):
        children = [x for child in refinement.children if (x := retain(child)) is not None]
        if children:
            refinements.append(Refinement(complete=refinement.complete,
                                          children=children,
                                          annotation=refinement.annotation))
    return type(goal)(name=name, refinements=refinements,
                      leaf=not bool(refinements))

melissa = retain(m.G1)
jason = retain(j.G26)
ruth = retain(r.G50)
root = AchieveGoal(name='Integrated co-parenting coordination and accountable mediation',
    refinements=[Refinement(complete=True, children=[melissa, jason, ruth], annotation='H4')])

# The policy tension remains visible, while the stakeholder OR refinements
# distinguish ordinary notice from exceptional short-notice cases.
def find_goal(goal, target):
    target = MERGED_GOALS.get(target, target)
    if goal.name.startswith(target + ':'):
        return goal
    for refinement in (getattr(goal, 'disjunctions', None) or []):
        for child in refinement.children:
            result = find_goal(child, target)
            if result is not None:
                return result
    return None

# Melissa requires ordinary schedule changes to provide at least 48 hours'
# notice, while Jason needs short-notice requests to remain possible when
# dispatch changes his route. The conditional/alternative refinements retain
# both policies, and this link records the stakeholder tension explicitly.
G4_NOTICE = find_goal(root, 'G-4')
G35_SHORT_NOTICE = find_goal(root, 'G-35')
if G4_NOTICE is None or G35_SHORT_NOTICE is None:
    raise RuntimeError('Unable to resolve conflict endpoints G-4 and G-35')
CONFLICTS = [ConflictLink(G4_NOTICE, G35_SHORT_NOTICE)]

if __name__ == '__main__':
    diagram = generate_graph([root], CONFLICTS)
    link = generate_pako_link(diagram, 'edit', config={
        'theme': 'default', 'themeVariables': {'fontFamily': 'Helvetica'}})
    with open('mermaid.txt', 'w', encoding='utf-8') as f:
        f.write(link + '\n')
    with open('combined_diagram.mmd', 'w', encoding='utf-8') as f:
        f.write(diagram + '\n')
    print('Generated combined model with 71 retained original goal IDs and 1 conflict.')
    print('Mermaid link:', link)
