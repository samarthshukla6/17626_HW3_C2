"""17-626 HW2: Ruth stakeholder goal model.
Source: Ruth(2).csv. IDs G-50 through G-79.
GOAL_SOURCES uses 1-based CSV data rows (excluding header).
Empty lists denote inferred refinement goals rather than direct quotations.
"""
from goalmodeling.schema import (
    AchieveGoal, AvoidGoal, MaintainGoal, SoftGoal,
    Refinement, generate_graph, generate_pako_link,
)

GOAL_SOURCES = {
    'G-50':[2,39,57], 'G-51':[7,9,11,13,41,43],
    'G-52':[7,9,43], 'G-53':[9,11,13], 'G-54':[9,13,35],
    'G-55':[13,41], 'G-56':[43,45], 'G-57':[45],
    'G-58':[15,19,22,35], 'G-59':[15,19], 'G-60':[15,19],
    'G-61':[19], 'G-62':[15,19,22], 'G-63':[22,26],
    'G-64':[26,30,43,45], 'G-65':[30], 'G-66':[30,45],
    'G-67':[30], 'G-68':[30,35], 'G-69':[33,35],
    'G-70':[33,35], 'G-71':[35], 'G-72':[35],
    'G-73':[48,51,54], 'G-74':[48,51], 'G-75':[51,54],
    'G-76':[54], 'G-77':[2,39,57], 'G-78':[57],
    'G-79':[41,43,45],
}

def goal(cls, number, description, *, refinements=None, leaf=False):
    return cls(name=f'G-{number}: {description}', refinements=refinements, leaf=leaf)

# Neutral, independently verifiable evidence and clear indication of gaps.
G52 = goal(AchieveGoal,52,'Custody order, messages, exchanges and receipts linked into a case timeline',leaf=True)
G53 = goal(MaintainGoal,53,'Original messages and edit or deletion events preserved append only',leaf=True)
G54 = goal(AchieveGoal,54,'Trusted server timestamps distinguish sent, delivered and read events',leaf=True)
G55 = goal(AchieveGoal,55,'Hashes and exportable chain of custody support independent verification',leaf=True)
G57 = goal(AchieveGoal,57,'Missing or unverified evidence labeled with reason and affected period',leaf=True)
G56 = goal(MaintainGoal,56,'Unverified timeline gaps not filled with parental assumptions',refinements=[
    Refinement(complete=True,children=[G57],annotation='H8')])
G79 = goal(SoftGoal,79,'Case record remains neutral complete and credible',leaf=True)
G51 = goal(AchieveGoal,51,'Verifiable case timeline available for mediation or court',refinements=[
    Refinement(complete=True,children=[G52,G53,G54,G55,G56,G79],annotation='H4')])

# Scoped authorization: two parental approvals OR recorded court order.
G59 = goal(AchieveGoal,59,'Both authenticated parents approve named case access',leaf=True)
G60 = goal(AchieveGoal,60,'Valid court order recorded as authorization source',leaf=True)
G61 = goal(MaintainGoal,61,'Mediator access pending if approval incomplete and no court order',leaf=True)
G62 = goal(MaintainGoal,62,'Mediator case view read only and role scoped',leaf=True)
G63 = goal(AvoidGoal,63,'Unrelated private communications disclosed to mediator',leaf=True)
G58 = goal(AchieveGoal,58,'Mediator access authorized and limited to relevant case evidence',refinements=[
    Refinement(complete=True,children=[G59,G62,G63],annotation='P2'),
    Refinement(complete=True,children=[G60,G62,G63],annotation='P2'),
])

# Disputes retain status, both sides' positions, and later resolution events.
G65 = goal(AchieveGoal,65,'Disputed items show each parent position and dispute reason',leaf=True)
G66 = goal(MaintainGoal,66,'Disputed or unverified items never silently presented as facts',leaf=True)
G67 = goal(AchieveGoal,67,'Clarification resolution and court findings appended as later events',leaf=True)
G68 = goal(AchieveGoal,68,'Dispute status and history included in read only case exports',leaf=True)
G64 = goal(AchieveGoal,64,'Disputed evidence managed transparently without prejudgment',refinements=[
    Refinement(complete=True,children=[G65,G66,G67,G68],annotation='H4')])

# Notification timing and verifiable delivery state.
G70 = goal(AchieveGoal,70,'Urgent schedule notifications sent within one or two minutes',leaf=True)
G71 = goal(AchieveGoal,71,'Sent delivered and opened notification states recorded using server time',leaf=True)
G72 = goal(AchieveGoal,72,'Failed delivery shown without assuming receipt or understanding',leaf=True)
G69 = goal(AchieveGoal,69,'Neutral case notifications delivered promptly and traceably',refinements=[
    Refinement(complete=True,children=[G70,G71,G72],annotation='H4')])

# Optional, non-censoring communication assistance.
G74 = goal(AchieveGoal,74,'Hostile phrase warning suggests neutral alternative without judging intent',leaf=True)
G75 = goal(MaintainGoal,75,'Parent can dismiss warning and send original message unchanged',leaf=True)
G76 = goal(AchieveGoal,76,'Warning and dismissal visible without implying misconduct',leaf=True)
G73 = goal(SoftGoal,73,'Respectful communication encouraged without censorship',refinements=[
    Refinement(complete=True,children=[G74,G75,G76],annotation='H6')])

G78 = goal(SoftGoal,78,'System remains simple during stressful exchanges',leaf=True)
G77 = goal(SoftGoal,77,'Child focused mediation supported without replacing professional judgment',refinements=[
    Refinement(complete=True,children=[G73,G78],annotation='H6')])
G50 = goal(AchieveGoal,50,'Fair evidence based child focused mediation supported',refinements=[
    Refinement(complete=True,children=[G51,G58,G61,G64,G69,G77],annotation='H4')])

ROOT_GOALS=[G50]
ALL_GOALS={f'G-{i}':globals()[f'G{i}'] for i in range(50,80)}

if __name__=='__main__':
    diagram=generate_graph(ROOT_GOALS,[])
    link=generate_pako_link(diagram,'edit',config={
        'theme':'default','themeVariables':{'fontFamily':'Helvetica'}})
    print('Ruth goal model: 30 goals')
    print('Mermaid link:',link)
    with open('ruth_mermaid.txt','w',encoding='utf-8') as f:f.write(link+'\n')
    with open('ruth_diagram.mmd','w',encoding='utf-8') as f:f.write(diagram+'\n')
    print('Saved ruth_mermaid.txt and ruth_diagram.mmd')
