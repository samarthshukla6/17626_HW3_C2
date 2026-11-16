"""
Goal model for stakeholder JASON (co-parent, long-haul driver).
Project: co-parenting schedule and communication app.
Sources: J1 = main interview, J2 = follow-up interview.

Notation
- Goal IDs G-n are unique across all stakeholder models.
- Yellow nodes are goals NOT stated in the transcript (see TACIT and missing.json).
- Refinement annotations use only the Appendix A codes (H3-H12, P1-P7).
  P2 marks an incomplete case split; P3 marks a complete one with a domain property.
- P2 vs P3: the assignment says "six patterns" but Appendix A has seven codes. The L3 slides
  show one decomposition-by-cases pattern in a complete form (the book's) and an incomplete
  form, and van Lamsweerde's own papers name it both "case-driven" and "decomposition-by-case".
  So P3 marks a complete case split backed by a domain property, and P2 an incomplete one.
- TRACE maps each goal to (source, CSV line, exact stakeholder quote).

Resolved vagueness
- "dependable" = shows the current agreed plan without lost changes, and without
  blaming him for something outside his control (J2 lines 9, 11).
- "reasonable" = as much notice as he actually has, usually two or three days,
  with no promise of 48 hours (J2 line 18). The interviewer's paraphrase "about
  48 hours" (J2 line 19) was NOT used because Jason did not say it.
- "fair" = for the kids, documented, divided as agreed, separate from child support
  (J2 lines 22, 24).
- "urgent" = cannot reasonably wait, especially about the kids or that day (J2 line
  28). He adds "I'd know it when I see it", so the term stays partly vague.
- "factual and neutral" = shows what happened without labels or guesses about
  motives (J2 line 36).
- Interviewer's "undisputed" (J2 line 44) was corrected by Jason (J2 lines 45, 47).

Ambiguity noted
- J1 line 45 says "the app showed my reply hours later", but no co-parenting app
  exists yet. Interpreted as the messaging tool he uses today.
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


# ---- Swaps ---------------------------------------------------------------------
g67 = AchieveGoal("G-67: PickupFeasibilityChecked <b>If</b> RouteChanged", env("Parent"), leaf=True)
g68 = AchieveGoal("G-68: SwapRequestSentWithReasonAndAlternateDate<br/><b>If</b> PickupNotFeasible",
                  env("Parent"), leaf=True)
g69 = MaintainGoal("G-69: SwapShownAsPendingUntilBothAgree", sw("ScheduleService"), leaf=True)
g70 = AchieveGoal("G-70: RequestAcceptedOrDeclinedWithReason <b>If</b> RequestReceived", env("Parent"), leaf=True)
g71 = MaintainGoal("G-71: OriginalScheduleRequestResponseAndFinalAgreementKeptTogether",
                   sw("ScheduleService"), leaf=True)
g66 = AchieveGoal("G-66: SwapAgreedAndRecorded <b>If</b> DispatchChangesRoute", refinements=[
    Refinement(False, [g67, g68, g70], annotation="P1")])

g72 = AvoidGoal("G-72: RequestAutomaticallyChangesCalendar", sw("ScheduleService"), leaf=True)
g73 = AchieveGoal("G-73: AlternativeSuggested <b>If</b> RequestNotWorkable", env("Parent"), leaf=True)
g74 = MaintainGoal("G-74: AsMuchNoticeGivenAsActuallyAvailable", env("Parent"), leaf=True)
g75 = AchieveGoal("G-75: PickupTimesPlaceAndActivitiesConfirmedBeforeWeekend", env("Parent"), leaf=True)
g168 = AvoidGoal("G-168: AnswerExpectedWithAlmostNoNotice", env("Parent"), leaf=True)
g76 = MaintainGoal("G-76: AlternatingWeekendsAndSummerWeeksShownInSchedule", sw("ScheduleService"), leaf=True)
g65 = MaintainGoal("G-65: ScheduleShowsCurrentAgreedPlanWithoutLostChanges", refinements=[
    Refinement(False, [g66, g69, g71, g72, g73, g74, g75, g76, g168], annotation="H4")])

# ---- Not looking absent --------------------------------------------------------
g157 = AchieveGoal("G-157: OutcomeShownAsHappened <b>If</b> ExchangeCompleted", sw("ScheduleService"), leaf=True)
g158 = AchieveGoal("G-158: OutcomeShownAsSwapped <b>If</b> SwapAgreed", sw("ScheduleService"), leaf=True)
g159 = AchieveGoal("G-159: OutcomeShownAsChangedForWork <b>If</b> DispatchChangedRoute", sw("ScheduleService"), leaf=True)
g78 = MaintainGoal("G-78: WeekendOutcomeShownAsHappenedSwappedOrChangedForWork", refinements=[
    Refinement(False, [g157, g158, g159], annotation="P2")])
g79 = AvoidGoal("G-79: RequestTreatedAsRefusalBeforeResponse", sw("ScheduleService"), leaf=True)
g81 = AchieveGoal("G-81: WrittenTimeCaptured <b>If</b> MessageComposed", sw("MobileClient"), leaf=True)
g82 = AchieveGoal("G-82: SentTimeRecorded <b>If</b> MessageTransmitted", sw("MessagingService"), leaf=True)
g83 = AchieveGoal("G-83: DeliveredAndReadStatusShown", sw("MessagingService"), leaf=True)
g80 = MaintainGoal("G-80: MessagesReflectRealTiming", refinements=[
    Refinement(False, [g81, g82, g83], annotation="H11")])
g77 = AvoidGoal("G-77: AppearingToHaveSkippedTimeOrIgnoredMessage", refinements=[
    Refinement(False, [g78, g79, g80], annotation="H4")])

# ---- Direct information --------------------------------------------------------
g86 = AchieveGoal("G-86: ParentRegisteredAsContactWithSchoolAndDoctor", env("Parent"), leaf=True)
g87 = AchieveGoal("G-87: SchoolAndDoctorSendNoticesDirectlyToParent", env("SchoolOrDoctorOffice"), leaf=True)
g88 = AchieveGoal("G-88: SchoolAndDoctorPortalsSyncedIntoApp", sw("PortalConnector"), leaf=True)
g173 = AchieveGoal("G-173: AlertSentWithinOneHour <b>If</b> NoticeReceived", sw("NotificationService"), leaf=True)
g89 = AchieveGoal("G-89: ParentAlertedWithFullDetailsAndEnoughNotice<br/><b>If</b> SchoolOrDoctorInfoArrives", refinements=[
    Refinement(False, [g173], annotation="H4")])
g85 = AchieveGoal("G-85: SchoolAndMedicalInfoReachesParentDirectly", refinements=[
    Refinement(False, [g86, g87, g89], annotation="P7"),   # OR alternative 1
    Refinement(False, [g88, g89], annotation="P7")])       # OR alternative 2

# ---- Working on the road -------------------------------------------------------
g84 = MaintainGoal("G-84: MessageSavedWhileOutOfCoverage", sw("MobileClient"), leaf=True)
g92 = AvoidGoal("G-92: TypingRequiredWhileDriving", sw("MobileClient"), leaf=True)
g110 = MaintainGoal("G-110: FirstScreenShowsScheduleWithPendingSwapAndPickupDetails", sw("MobileClient"), leaf=True)
g91 = SoftGoal("G-91: Increase[EaseOfUseOnTheRoad]", refinements=[
    Refinement(False, [g92, g110], annotation="H4")])
g90 = MaintainGoal("G-90: AppWorksWithPoorOrNoSignal", refinements=[
    Refinement(False, [g84, g91], annotation="H3")])

# ---- Urgent contact ------------------------------------------------------------
g93 = AchieveGoal("G-93: UrgentCallPossible<br/><b>If</b> IssueCannotReasonablyWait", env("Parent"), leaf=True)
g172 = MaintainGoal("G-172: NonUrgentDisagreementsRaisedInWriting", env("Parent"), leaf=True)
g94 = AvoidGoal("G-94: EveryDisagreementTurnsIntoCall", refinements=[
    Refinement(False, [g172], annotation="P7")])
g95 = MaintainGoal("G-95: AbilityToCallKeptForUrgentIssues", refinements=[
    Refinement(False, [g93, g94], annotation="H6")])

# ---- Expenses ------------------------------------------------------------------
g97 = AvoidGoal("G-97: ChildSupportMixedWithSharedExpenses", sw("ExpenseLedger"), leaf=True)
g98 = MaintainGoal("G-98: ExpenseDocumentedWithReceiptPurposeAndInsuranceCoverage", env("Parent"), leaf=True)
g99 = AchieveGoal("G-99: ExpenseDividedAsAgreed", sw("ExpenseLedger"), leaf=True)
g100 = MaintainGoal("G-100: RunningBalanceShowsPaidAndOwed", sw("ExpenseLedger"), leaf=True)
g102 = AvoidGoal("G-102: DisputedAmountAddedToOwedBalance", sw("ExpenseLedger"), leaf=True)
g103 = AvoidGoal("G-103: AppChangesAmountAutomatically", sw("ExpenseLedger"), leaf=True)
g104 = MaintainGoal("G-104: BothPositionsAndUnresolvedBalanceRecorded", sw("ExpenseLedger"), leaf=True)
g101 = MaintainGoal("G-101: DisputedExpenseOpenUntilAgreedOrResolved", refinements=[
    Refinement(False, [g102, g103, g104], annotation="H8")])
g96 = MaintainGoal("G-96: SharedExpensesFair", refinements=[
    Refinement(False, [g97, g98, g99, g100, g101], annotation="H4")])

# ---- Neutral record ------------------------------------------------------------
g106 = AvoidGoal("G-106: RecordJudgesOrLabelsAParent", sw("RecordService"), leaf=True)
g107 = MaintainGoal("G-107: EveryChangeShowsWhoMadeItAndWhen", sw("RecordService"), leaf=True)
g108 = MaintainGoal("G-108: BothParentsSeeSameRecord", sw("RecordService"), leaf=True)
g109 = SoftGoal("G-109: Minimize[RoutineCoordinationFeelingLikeFormalEvidence]", refinements=[
    Refinement(False, [g106], annotation="H8")])
g105 = MaintainGoal("G-105: RecordFactualAndNeutral", refinements=[
    Refinement(False, [g106, g107, g108], annotation="P5")])

# ---- Expense view --------------------------------------------------------------
g111 = MaintainGoal("G-111: ExpensesViewSeparatesAgreedDisputedAndChildSupport", sw("MobileClient"), leaf=True)

# ---- Root ----------------------------------------------------------------------
g64 = SoftGoal("G-64: Maximize[InvolvementWithChildrenDespiteRoadSchedule]", refinements=[
    Refinement(False, [g65, g77, g85, g90, g95, g96, g105, g109, g111], annotation="H7")])

ROOT = g64
LINKS = []
TACIT = {"G-86": g86, "G-88": g88, "G-92": g92, "G-172": g172, "G-173": g173}

TRACE = {
    "G-64": [("J1", 85, "I need to be able to stay involved even when I’m out on the road.")],
    "G-65": [("J2", 9, "the schedule should show the current agreed plan clearly, without changes getting lost")],
    "G-66": [("J1", 49, "I want the request and her response recorded so it’s clear I didn’t just abandon my time")],
    "G-67": [("J1", 49, "I check whether I can still make pickup")],
    "G-68": [("J1", 31, "I’d want to send the request in the app, suggest another date"),
             ("J1", 51, "I explain what dispatch changed and suggest another weekend")],
    "G-69": [("J1", 31, "have it show as pending until we both agree")],
    "G-70": [("J2", 20, "give me a way to accept or decline with a reason")],
    "G-71": [("J1", 55, "I want the original schedule, my request, and whatever we agree on all kept together")],
    "G-72": [("J1", 58, "I don’t want a request to automatically change the calendar")],
    "G-73": [("J1", 58, "if not, I’ll suggest another option")],
    "G-74": [("J2", 18, "reasonable means I give as much notice as I actually have—usually two or three days—but I can’t promise 48 hours every time because dispatch changes routes")],
    "G-75": [("J1", 29, "before a weekend I need to confirm the pickup and drop-off times, where I’m collecting them, and whether they’ve got activities or homework planned")],
    "G-76": [("J1", 9, "I have the kids every other weekend, plus two weeks in the summer.")],
    "G-77": [("J1", 83, "nothing would make it look like I skipped my time or refused to pay when something was actually disputed")],
    "G-78": [("J2", 13, "the app needs to show whether a weekend happened, was swapped, or was changed because of work")],
    "G-157": [("J2", 13, "whether a weekend happened")],
    "G-158": [("J2", 13, "was swapped")],
    "G-159": [("J2", 13, "was changed because of work")],
    "G-168": [("J2", 20, "Unreasonable is when someone expects an answer or a change with almost no notice")],
    "G-79": [("J2", 20, "treats a request as a refusal before I’ve had a chance to respond")],
    "G-80": [("J1", 83, "messages would reflect the real timing")],
    "G-81": [("J2", 34, "It should show when I wrote it")],
    "G-82": [("J2", 34, "when the app actually sent it after I got signal")],
    "G-83": [("J2", 34, "whether it was delivered or read")],
    "G-84": [("J2", 32, "I need to know the message is saved and hasn’t just disappeared.")],
    "G-85": [("J2", 45, "school and healthcare information needs to come directly to me, not filtered through Melissa")],
    "G-87": [("J1", 34, "I’d rather get school notices, activity details, and doctor information directly")],
    "G-89": [("J1", 39, "I need enough notice and the actual details so I can be involved"),
             ("J1", 90, "Then I need clear alerts for school or doctor information")],
    "G-90": [("J1", 94, "it needs to work when I’m driving through places with no signal")],
    "G-91": [("J2", 40, "the app was too hard to use on the road")],
    "G-93": [("J2", 30, "a call should be available whenever there’s an urgent issue"),
             ("J2", 28, "urgent is when it can’t reasonably wait until later")],
    "G-94": [("J2", 30, "I don’t want every little disagreement turning into a call")],
    "G-95": [("J1", 87, "I wouldn’t want to lose the ability to call when something urgent comes up with the kids.")],
    "G-96": [("J2", 24, "Fair means it’s for the kids, documented, divided as agreed, and kept separate from child support.")],
    "G-97": [("J1", 61, "shouldn’t get mixed in with shared expenses in the app")],
    "G-98": [("J1", 69, "I’d need the actual medical bill or receipt showing what it was for and what insurance covered")],
    "G-99": [("J2", 26, "it should be split according to what we agreed before")],
    "G-100": [("J1", 71, "there should be a running balance showing what I still owe")],
    "G-101": [("J2", 47, "the app needs to show that it’s disputed and leave it open until we agree or it gets resolved")],
    "G-102": [("J1", 80, "The amount shouldn’t be treated as settled or added to what I owe until we both agree")],
    "G-103": [("J1", 73, "I don’t want the app changing the amount automatically")],
    "G-104": [("J1", 73, "I want both positions and the unresolved balance recorded")],
    "G-105": [("J1", 94, "I’d also want the records to be factual and neutral")],
    "G-106": [("J2", 36, "without calling anybody unreliable or making guesses about motives"),
              ("J2", 40, "I’d stop using it if the records started making judgments about me")],
    "G-107": [("J2", 40, "if changes could be made without showing who made them and when")],
    "G-108": [("J2", 36, "so both sides can see the same record")],
    "G-109": [("J1", 87, "I don’t want every little conversation to feel like a formal record being used against me")],
    "G-110": [("J1", 90, "I need to see the current custody schedule first, including any pending swap and the pickup details")],
    "G-111": [("J1", 90, "expenses separated between agreed, disputed, and child support")],
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
