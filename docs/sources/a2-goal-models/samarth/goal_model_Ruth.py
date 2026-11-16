"""
Goal model for stakeholder RUTH (family mediator, about 40 high-conflict cases a year).
Project: co-parenting schedule and communication app.
Source: R1 = main interview (no follow-up interview was conducted).

Notation
- Goal IDs G-n are unique across all stakeholder models.
- Yellow nodes are goals NOT stated in the transcript (see TACIT and missing.json).
- Refinement annotations use only the Appendix A codes (H3-H12, P1-P7).
- TRACE maps each goal to (source, CSV line, exact stakeholder quote).

Resolved vagueness (Ruth's own definitions)
- "contemporaneous" = recorded at or near the time it happened (line 22).
- "audit trail" = original entry, who made it, when, and any later changes (line 22).
- "reliable" = complete, time-stamped by a trusted source, attributable, consistent
  for both parents, and preserving originals with later changes (line 29).
- "neutral tone" = addresses the child-related fact or request without insults,
  accusations, threats or speculation about motives (line 44).
- "authorized participants" = parents in the case, authorized legal representatives
  when appropriate, and a properly granted mediator or court official (line 66).
- "ammunition" = material saved to prove the other parent is bad rather than to
  solve a child-related problem (line 72).

Transcription notes
- "better recruiter" (line 56) and "building schedule" (line 79) are speech-recognition
  errors in the interviewer's turns; Ruth corrected them, and neither became a goal.
"""
import json
import re

from goalmodeling.schema import *


CONFIG = json.dumps({"theme": "base"})  # mermaid.live reads this setting as a JSON string

# Fixed colors keep the diagram readable when mermaid.live runs in dark mode.
STYLE = '%%{init: ' + json.dumps({
    "theme": "base",
    "themeVariables": {"primaryColor": "#ececff", "primaryTextColor": "#000000",
                       "primaryBorderColor": "#9370db", "lineColor": "#888888",
                       "tertiaryColor": "#ffffff"},
    "flowchart": {"nodeSpacing": 18, "rankSpacing": 30}}) + '}%%\n'


def sw(name):
    return [PerformanceLink(Agent(name, AgentType.SOFTWARE_AGENT), None)]


def env(name):
    return [PerformanceLink(Agent(name, AgentType.ENVIRONMENT_AGENT), None)]


# ---- Reliable record -----------------------------------------------------------
g119 = MaintainGoal("G-119: EntriesTimestampedByTrustedServer", sw("TimeService"), leaf=True)
g120 = MaintainGoal("G-120: EachEntryAttributedToItsAuthor", sw("RecordService"), leaf=True)
g121 = MaintainGoal("G-121: AuditTrailShowsOriginalEntryAndLaterChanges", sw("RecordService"), leaf=True)
g122 = MaintainGoal("G-122: ChangedOrDeletedMaterialStaysVisibleAsChanged", sw("RecordService"), leaf=True)
g123 = AvoidGoal("G-123: ParentQuietlyAltersHistory", sw("RecordService"), leaf=True)
g124 = MaintainGoal("G-124: ScheduledEventsDistinguishedFromActualEvents", sw("RecordService"), leaf=True)
g125 = AchieveGoal("G-125: ActualEventRecordedAtOrNearTheTime", env("Parent"), leaf=True)
g126 = MaintainGoal("G-126: MessageShownWithSurroundingContext", sw("RecordService"), leaf=True)
g117 = MaintainGoal("G-117: RecordCompleteTimestampedAttributableAndConsistent", refinements=[
    Refinement(False, [g119, g120, g121, g122, g123, g124, g125, g126], annotation="H4")])

g127 = MaintainGoal("G-127: DiscussionsTiedToSpecificChildRelatedIssue", sw("MessagingService"), leaf=True)
g128 = MaintainGoal("G-128: ExpenseViewConnectsChildDateAmountReceiptAndResponses", sw("ExpenseLedger"), leaf=True)
g129 = MaintainGoal("G-129: ExpenseStatusShownAsRequestedApprovedPaidReimbursedOrDisputed",
                    sw("ExpenseLedger"), leaf=True)
g130 = MaintainGoal("G-130: ExpenseShowsWhoPaidAndWhetherAgreedInAdvance", sw("ExpenseLedger"), leaf=True)
g116 = MaintainGoal("G-116: SingleNeutralRecordSharedByParentsAndCourt", refinements=[
    Refinement(False, [g117, g127, g128, g129, g130], annotation="P5")])
g113 = SoftGoal("G-113: Reduce[RoutineDisagreementsReachingJudge]", refinements=[
    Refinement(False, [g116], annotation="H12")])

# ---- Access --------------------------------------------------------------------
g132 = AvoidGoal("G-132: AccessViaGeneralLinkOrAnotherCase", sw("AccessControl"), leaf=True)
g133 = AchieveGoal("G-133: ReviewerGrantedCaseSpecificAccess<br/><b>If</b> BothParentsConsentOrCourtOrder",
                   sw("AccessControl"), leaf=True)
g134 = MaintainGoal("G-134: ReviewerAccessReadOnly", sw("AccessControl"), leaf=True)
g114 = AchieveGoal("G-114: ReviewerReadsCaseRecord <b>If</b> AccessGranted", refinements=[
    Refinement(True, [g133, g134], annotation="P4")])
g135 = CeaseGoal("G-135: ReviewerAccess <b>If</b> GrantRevokedOrExpired", sw("AccessControl"), leaf=True)
g136 = MaintainGoal("G-136: ParentsInCaseSeeCompleteRecord", sw("AccessControl"), leaf=True)
g165 = AchieveGoal("G-165: LegalRepresentativeGrantedCaseAccess <b>If</b> Authorized", sw("AccessControl"), leaf=True)
g131 = MaintainGoal("G-131: AccessLimitedToAuthorizedCaseParticipants", refinements=[
    Refinement(False, [g132, g114, g135, g136, g165], annotation="H10")])

# ---- Tone (alternatives from pros and cons) ------------------------------------
g163 = AchieveGoal("G-163: MessageFlagged <b>If</b> ContainsInsultAccusationThreatOrMotiveSpeculation",
                   sw("MessagingService"), leaf=True)
g139 = AchieveGoal("G-139: OptionalToneWarningShown <b>If</b> MessageAppearsHostile", refinements=[
    Refinement(False, [g163], annotation="H4")])
g140 = AvoidGoal("G-140: AppBlocksOrRewritesMessage", sw("MessagingService"), leaf=True)
g141 = AchieveGoal("G-141: NeutralChildFocusedTemplateOffered <b>If</b> ParentComposesRequest",
                   sw("MessagingService"), leaf=True)
g138 = SoftGoal("G-138: Reduce[HostileCommunication]", refinements=[
    Refinement(False, [g139, g140], annotation="H6"),   # OR alternative 1
    Refinement(False, [g141, g140], annotation="H6")])  # OR alternative 2

# ---- Misuse --------------------------------------------------------------------
g171 = MaintainGoal("G-171: EntriesCreatedOnlyAgainstChildRelatedIssueOrEvent", sw("RecordService"), leaf=True)
g143 = AvoidGoal("G-143: CollectingIncidentsEasierThanCommunicating", refinements=[
    Refinement(False, [g171], annotation="H4")])
g142 = AvoidGoal("G-142: AppUsedToCollectAmmunition", refinements=[
    Refinement(False, [g143], annotation="H8")])

# ---- Review --------------------------------------------------------------------
g145 = AchieveGoal("G-145: ReviewerFirstSeesCurrentScheduleAndUpcomingExchanges", sw("RecordService"), leaf=True)
g146 = AchieveGoal("G-146: RecentChangesUnresolvedExpensesAndMessagesShownTogether", sw("RecordService"), leaf=True)
g144 = SoftGoal("G-144: Increase[EaseOfRecordReview]", refinements=[
    Refinement(False, [g145, g146], annotation="H4")])

# ---- Root ----------------------------------------------------------------------
g112 = SoftGoal("G-112: Maximize[MediationFocusedOnChildrenNotCompetingEvidence]", refinements=[
    Refinement(False, [g113, g131, g138, g142, g144], annotation="H7")])

ROOT = g112
LINKS = []
TACIT = {"G-135": g135, "G-141": g141, "G-171": g171}

TRACE = {
    "G-112": [("R1", 59, "mediation sessions focused on decisions for the children rather than arguments over whose evidence was accurate")],
    "G-113": [("R1", 59, "fewer routine disagreements reached the judge")],
    "G-116": [("R1", 25, "A single neutral record would make that process much more reliable.")],
    "G-117": [("R1", 29, "A reliable record is complete, time-stamped by a trusted source, attributable to the person who made the entry, and consistent for both parents")],
    "G-119": [("R1", 22, "The time should come from a trusted server rather than a parent’s phone, because device clocks can be wrong.")],
    "G-120": [("R1", 29, "attributable to the person who made the entry")],
    "G-121": [("R1", 20, "an audit trail showing the original entry and any later changes, rather than a cleaned-up version")],
    "G-122": [("R1", 22, "changed or deleted messages must remain visible as changed, not disappear")],
    "G-123": [("R1", 14, "provided neither parent can quietly alter the history")],
    "G-124": [("R1", 29, "It should distinguish scheduled parenting time from what actually occurred")],
    "G-125": [("R1", 22, "Contemporaneous documentation means a record made at or near the time something happened")],
    "G-126": [("R1", 29, "show enough surrounding context that a message isn’t misleading when taken alone")],
    "G-127": [("R1", 14, "the system should keep discussions tied to a specific child-related issue")],
    "G-128": [("R1", 51, "I need to see the expense, the child it relates to, the date, the amount, the receipt, and each parent’s response in one connected view.")],
    "G-129": [("R1", 51, "It should be clear whether the expense was requested, approved, paid, reimbursed, or disputed")],
    "G-130": [("R1", 49, "whether it was agreed to in advance"),
              ("R1", 49, "show who paid it")],
    "G-131": [("R1", 64, "access should be limited to authorized participants rather than anyone with a general link")],
    "G-132": [("R1", 66, "simply having a link or being involved in another case shouldn’t provide access")],
    "G-133": [("R1", 64, "I’d need read-only access to specific cases, granted by both parents or by court order")],
    "G-134": [("R1", 66, "Access should be case-specific and read-only for reviewers like me")],
    "G-136": [("R1", 64, "the parents involved in a case should see the complete record for that case")],
    "G-138": [("R1", 61, "less hostile communication")],
    "G-139": [("R1", 42, "A warning before sending a message that appears hostile can help parents reconsider")],
    "G-163": [("R1", 44, "addresses the child-related fact or request without insults, accusations, threats, or speculation about the other parent’s motives")],
    "G-165": [("R1", 66, "their authorized legal representatives when appropriate")],
    "G-140": [("R1", 42, "it must not block or rewrite the message")],
    "G-142": [("R1", 69, "it can make a case worse if parents use it to collect ammunition instead of coordinate care")],
    "G-143": [("R1", 72, "the app can encourage that if it makes collecting incidents easier than communicating responsibly")],
    "G-144": [("R1", 29, "I also need the calendar and expense history to be easy to review")],
    "G-145": [("R1", 77, "I’d expect to see the current parenting schedule and any upcoming exchanges first, including scheduled times and locations")],
    "G-146": [("R1", 79, "I’d want upcoming exchanges, recent changes, unresolved expenses, and the related messages visible together")],
    "G-114": [("R1", 64, "so I can review the record without altering it")],
}


def wrap_labels(output, width=24):
    """Break long CamelCase labels over several lines so the diagram stays legible."""
    def wrap_word(word):
        if word.startswith("<") or len(word) <= width:
            return word
        lines, line = [], ""
        for part in re.findall(r"[A-Z]?[^A-Z]*", word):
            if line and len(line) + len(part) > width:
                lines.append(line)
                line = ""
            line += part
        return "<br/>".join(lines + [line])

    def wrap_quoted(match):
        parts = re.split(r"( |<br/>|<b>.*?</b>)", match.group(1))
        return '"' + "".join(wrap_word(part) for part in parts) + '"'

    return re.sub(r'"([^"\n]{25,})"', wrap_quoted, output)


def highlight(output, goals):
    """Add yellow fill to goals that are not stated in the transcript."""
    ids = ",".join(goal.get_node_id() for goal in goals)
    return output + ("\nclassDef stroke stroke-dasharray: 5 5,fill:#ffffff,fill-opacity:1,color:#000\n"
                     f"classDef missing fill:#ffff00,color:#000\nclass {ids} missing\n")


def build():
    return STYLE + wrap_labels(highlight(generate_graph([ROOT], LINKS), TACIT.values()))


if __name__ == "__main__":
    output = build()
    print(output)
    print(generate_pako_link(output, "edit", config=CONFIG))
