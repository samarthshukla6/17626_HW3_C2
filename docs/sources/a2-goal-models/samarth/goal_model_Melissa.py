"""
Goal model for stakeholder MELISSA Grant (parent with primary custody).
Project: co-parenting schedule and communication app.
Sources: M1 = main interview, M2 = follow-up interview.

Notation
- Goal IDs G-n are unique across all stakeholder models.
- Yellow nodes are goals NOT stated in the transcript (see TACIT and missing.json).
- Refinement annotations use only the Appendix A codes (H3-H12, P1-P7).
- P2 vs P3: the assignment says "six patterns" but Appendix A has seven codes. The L3 slides
  show one decomposition-by-cases pattern in a complete form (the book's) and an incomplete
  form, and van Lamsweerde's own papers name it both "case-driven" and "decomposition-by-case".
  So P3 marks a complete case split backed by a domain property, and P2 an incomplete one.
- TRACE maps each goal to (source, CSV line, exact stakeholder quote).

Resolved vagueness (stakeholder's own definitions unless a goal is yellow)
- "dependable" = accurate, updated promptly, and clear enough that neither parent
  can claim to have understood it differently (M2 line 10).
- "reasonable notice" = 48 hours unless there is a genuine emergency (M2 line 17).
- "genuine emergency" = unexpected, serious, involves the children, and waiting
  creates a real problem; excludes work, poor planning, changed minds (M2 line 19).
- My interpretations, modeled as yellow goals: "promptly" = as soon as the second
  confirmation is stored (G-160); "couple of obvious steps" = two taps (G-161);
  "understandable" = one chronological timeline (G-162).

Inconsistencies inside this stakeholder's own statements
- M1 line 41 treats an "unexpected sick day" as an exception, but M2 lines 21 and 33 only
  count a "sudden medical issue requiring immediate care". Unstated condition: an ordinary
  illness shortens the notice but is not an emergency, so it is its own case (G-170).
- M1 line 41 says 48 hours "when possible"; M2 line 17 says 48 hours unless a genuine
  emergency. Unstated condition: the exception is the emergency case (G-20, G-21).
- M1 line 39 describes typing the actual time; M2 line 27 rejects "just a note one
  of us typed afterward". Modeled as an OR-refinement of G-34.
- M2 line 31 wants areas "clearly separated"; M1 line 77 wants "one event" showing
  everything. Unstated condition: separate areas, with links between related items
  (G-59 and G-33 are both retained).
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


# ---- Schedule: original plan ----------------------------------------------------
g4 = AvoidGoal("G-4: OriginalPlanChangedOrDeleted", sw("ScheduleService"), leaf=True)
g5 = MaintainGoal("G-5: OriginalPlanShownBesideAnyProposedChange", sw("ScheduleService"), leaf=True)
g6 = MaintainGoal("G-6: AgreedChangesRecordedSeparatelyFromOriginal", sw("ScheduleService"), leaf=True)
g3 = MaintainGoal("G-3: OriginalCourtPlanPreservedAndVisible", refinements=[
    Refinement(True, [g4, g5, g6], annotation="H4")])

# ---- Schedule: change agreement ------------------------------------------------
g9 = AchieveGoal("G-9: RequestSentInWritingWithReasonAndProposedDateTime<br/><b>If</b> ChangeNeeded",
                 env("Parent"), leaf=True)
g10 = AchieveGoal("G-10: ReceiptConfirmedWithDateTime <b>If</b> RequestSent", sw("MessagingService"), leaf=True)
g11 = MaintainGoal("G-11: RequestStatusShownAsPendingAcceptedOrDeclined", sw("ScheduleService"), leaf=True)
g14 = AchieveGoal("G-14: RespondingParentAnswersInWriting <b>If</b> RequestPending", env("Parent"), leaf=True)
g15 = AchieveGoal("G-15: WrittenFollowUpSent <b>If</b> NoReply", env("Parent"), leaf=True)
g12 = AchieveGoal("G-12: WrittenResponseObtained <b>If</b> RequestSent", refinements=[
    Refinement(False, [g14, g15], annotation="P7")])
g160 = AchieveGoal("G-160: CalendarUpdatedImmediately <b>If</b> SecondConfirmationStored", sw("ScheduleService"), leaf=True)
g13 = AchieveGoal("G-13: CalendarUpdatedPromptly <b>If</b> ChangeAccepted", refinements=[
    Refinement(False, [g160], annotation="H4")])
g8 = AchieveGoal("G-8: ScheduleChanged <b>If</b> BothParentsConfirmInWriting", refinements=[
    Refinement(False, [g9, g10, g12, g13], annotation="P1")])

g17 = MaintainGoal("G-17: UnansweredRequestKeptWithSentDateTime", sw("MessagingService"), leaf=True)
g169 = AchieveGoal("G-169: RequestMarkedOverdue <b>If</b> NoResponseWithinNoticePeriod", sw("ScheduleService"), leaf=True)
g18 = MaintainGoal("G-18: OriginalScheduleInForce<br/><b>If</b> NotAgreed <b>And</b> NoEmergencyOrFormalDecision",
                   sw("ScheduleService"), leaf=True)
g16 = AvoidGoal("G-16: ChangeShownAsAgreed <b>If</b> RequestUnansweredOrDeclined", refinements=[
    Refinement(False, [g11, g17, g169, g18], annotation="H8")])
g7 = MaintainGoal("G-7: OnlyMutuallyConfirmedChangesTreatedAsAgreed", refinements=[
    Refinement(True, [g8, g16], annotation="H10")])

# ---- Schedule: notice ----------------------------------------------------------
dp1 = DomainProperty("Each change request is a genuine emergency,<br/>an unexpected child illness, or neither", leaf=True)
g20 = AchieveGoal("G-20: RequestSent48HoursAhead <b>If</b> NoEmergencyOrUnexpectedIllness", env("Parent"), leaf=True)
g21 = AchieveGoal("G-21: RequestSentAsSoonAsKnown <b>If</b> GenuineEmergency", env("Parent"), leaf=True)
g170 = AchieveGoal("G-170: RequestSentAsSoonAsKnown <b>If</b> UnexpectedChildIllness", env("Parent"), leaf=True)
g19 = AchieveGoal("G-19: RequiredNoticeGivenForScheduleChange", refinements=[
    Refinement(True, [dp1, g20, g21, g170], annotation="P3")])

dp2 = DomainProperty("GenuineEmergency <b>Iff</b> Unexpected, Serious, InvolvesChildren,<br/>AndWaitingCreatesRealProblem",
                     leaf=True)
g23 = AchieveGoal("G-23: EmergencyReasonStatedInRequest <b>If</b> EmergencyClaimed", env("Parent"), leaf=True)
g24 = AchieveGoal("G-24: EmergencyClaimContestedInWriting <b>If</b> OtherParentDisagrees", env("Parent"), leaf=True)
g22 = AvoidGoal("G-22: WorkOrPlanningIssueTreatedAsEmergency", refinements=[
    Refinement(False, [dp2, g23, g24], annotation="P6")])

# ---- Schedule: reminders and activities ----------------------------------------
g26 = AchieveGoal("G-26: ReminderSent <b>If</b> ConfirmedExchangeUpcoming", sw("NotificationService"), leaf=True)
g27 = AchieveGoal("G-27: ReminderSent <b>If</b> NoticeDeadlineUpcoming", sw("NotificationService"), leaf=True)
g28 = CeaseGoal("G-28: ExchangeReminders <b>If</b> ExchangeCancelledOrRescheduled",
                sw("NotificationService"), leaf=True)
g25 = AchieveGoal("G-25: ParentRemindedOfExchangesAndNoticeDeadlines", refinements=[
    Refinement(False, [g26, g27, g28], annotation="H9")])
g29 = MaintainGoal("G-29: ChildActivitiesAndAppointmentsShownWithConnectedExchange",
                   sw("ScheduleService"), leaf=True)

g166 = AvoidGoal("G-166: ActivityNoticeTreatedAsScheduleChange", sw("ScheduleService"), leaf=True)
g167 = AchieveGoal("G-167: NoticeStatesWhoHandlesPickupAndActivityEndTime<br/><b>If</b> ActivityOverlapsExchange",
                   env("Parent"), leaf=True)
g164 = MaintainGoal("G-164: HolidaysAndSchoolBreaksShownInSchedule", sw("ScheduleService"), leaf=True)
g2 = MaintainGoal("G-2: CustodyScheduleClearAndDependable", refinements=[
    Refinement(False, [g3, g7, g19, g22, g25, g29, g164, g166, g167], annotation="H4")])

# ---- One connected record ------------------------------------------------------
g31 = MaintainGoal("G-31: CompleteMessageHistoryPreservedInOriginalForm", sw("MessagingService"), leaf=True)
g32 = MaintainGoal("G-32: MessagesOrganizedByChildOrEvent", sw("MessagingService"), leaf=True)
g33 = MaintainGoal("G-33: OneEventShowsScheduledTimeRequestResponseAndActualTime", sw("ScheduleService"), leaf=True)
g35 = AchieveGoal("G-35: ArrivalAndExchangeTimestampedAtTheExchange", sw("ExchangeLog"), leaf=True)
g36 = AchieveGoal("G-36: ActualTimeEnteredWithRelatedMessage", env("Parent"), leaf=True)
g34 = MaintainGoal("G-34: ScheduledAndActualExchangeTimesBothPreserved", refinements=[
    Refinement(False, [g35], annotation="P6"),   # OR alternative 1
    Refinement(False, [g36], annotation="P6")])  # OR alternative 2
g30 = MaintainGoal("G-30: ScheduleMessagesAndExpensesConnectedInOneRecord", refinements=[
    Refinement(False, [g31, g32, g33, g34], annotation="P5")])

# ---- Written contact and handoffs ----------------------------------------------
dp3 = DomainProperty("CourtOrderLimitsContactToWrittenMessagesAboutChildren", leaf=True)
g37 = MaintainGoal("G-37: ParentContactKeptInWriting", env("Parent"), leaf=True)

g39 = AchieveGoal("G-39: ChildItemsReadyBeforeExchange", env("Parent"), leaf=True)
g40 = AchieveGoal("G-40: DelayOrChangeMessagedInWriting <b>If</b> ExchangeAffected", env("Parent"), leaf=True)
g41 = MaintainGoal("G-41: DesignatedExchangeLocationShown", sw("ScheduleService"), leaf=True)
g38 = AchieveGoal("G-38: HandoffWithoutArguingInFrontOfChildren", refinements=[
    Refinement(False, [g39, g40, g41], annotation="H4")])

# ---- Expenses ------------------------------------------------------------------
g43 = AchieveGoal("G-43: ExpenseRecordedWithCategoryAndReceipt", env("Parent"), leaf=True)
g63 = AchieveGoal("G-63: RequestIncludesReceiptCategoryShareAndPaymentDate", env("Parent"), leaf=True)
g45 = AchieveGoal("G-45: ReimbursementRequested <b>If</b> CategoryAndReceiptClear", refinements=[
    Refinement(False, [g43, g63], annotation="P4")])

dp4 = DomainProperty("Each expense is medical/school or another category", leaf=True)
g48 = AchieveGoal("G-48: Split50-50 <b>If</b> MedicalOrSchoolExpense", sw("ExpenseLedger"), leaf=True)
g49 = AchieveGoal("G-49: SplitPerParentingPlan <b>If</b> OtherCategory", sw("ExpenseLedger"), leaf=True)
g44 = AchieveGoal("G-44: ParentShareCalculated", refinements=[
    Refinement(True, [dp4, g48, g49], annotation="P3")])

g46 = AchieveGoal("G-46: PaymentRecordedWithRequestAndReceipt", sw("ExpenseLedger"), leaf=True)
g50 = AchieveGoal("G-50: DisagreementExplainedInWriting <b>If</b> CalculationDisputed", env("Parent"), leaf=True)
g51 = AchieveGoal("G-51: ReceiptAndCategoryReviewedAgainstPlan <b>If</b> CalculationDisputed", env("Parent"), leaf=True)
g52 = MaintainGoal("G-52: DisputeAndResponseKeptWithRequest", sw("ExpenseLedger"), leaf=True)
g53 = AvoidGoal("G-53: RecordChanged <b>If</b> DisputeUnresolved", sw("ExpenseLedger"), leaf=True)
g47 = AchieveGoal("G-47: DisputeHandledInWriting <b>If</b> CalculationDisputed", refinements=[
    Refinement(False, [g50, g51, g52, g53], annotation="H4")])
g42 = AchieveGoal("G-42: ChildExpensesReimbursed", refinements=[
    Refinement(False, [g44, g45, g46], annotation="P1")])

# ---- Export --------------------------------------------------------------------
g55 = MaintainGoal("G-55: ExportIncludesFullHistoryNotSelectedMessages", sw("ExportService"), leaf=True)
g162 = MaintainGoal("G-162: ExportPresentedAsSingleChronologicalTimeline", sw("ExportService"), leaf=True)
g56 = MaintainGoal("G-56: ExportUnderstandableWithoutScreenshots", refinements=[
    Refinement(False, [g162], annotation="H4")])
g54 = AchieveGoal("G-54: CompleteRecordExported <b>If</b> MediatorOrCourtReviewNeeded", refinements=[
    Refinement(False, [g55, g56], annotation="H5")])

# ---- Simplicity and child view -------------------------------------------------
g58 = MaintainGoal("G-58: CurrentScheduleAndPendingChangeVisibleWithoutMenus", sw("MobileClient"), leaf=True)
g59 = MaintainGoal("G-59: MessageCalendarExpenseAreasClearlySeparated", sw("MobileClient"), leaf=True)
g161 = MaintainGoal("G-161: ConfirmOrDeclineWithinTwoTapsFromFirstScreen", sw("MobileClient"), leaf=True)
g60 = MaintainGoal("G-60: ConfirmOrDeclineInCoupleOfObviousSteps", refinements=[
    Refinement(False, [g161], annotation="H4")])
g61 = MaintainGoal("G-61: WaitingActionShownToParent", sw("MobileClient"), leaf=True)
g57 = SoftGoal("G-57: Increase[EaseOfUseForBothParents]", refinements=[
    Refinement(False, [g58, g59, g60, g61], annotation="H3")])
g62 = MaintainGoal("G-62: OlderChildSeesScheduleOnly", sw("AccessControl"), leaf=True)

# ---- Root ----------------------------------------------------------------------
g1 = SoftGoal("G-1: Minimize[ConflictInFrontOfChildren]", refinements=[
    Refinement(False, [g2, g30, dp3, g37, g38, g42, g47, g54, g57, g62], annotation="H7")])

ROOT = g1
LINKS = []
TACIT = {"G-23": g23, "G-24": g24, "G-28": g28, "G-160": g160, "G-161": g161, "G-162": g162}

TRACE = {
    "G-1": [("M1", 85, "so there’s less conflict and less discussion in front of the kids")],
    "G-2": [("M2", 8, "The custody schedule has to be clear and dependable for both of us."),
            ("M2", 10, "It means the schedule is accurate, updated promptly when something changes")],
    "G-3": [("M1", 79, "I’d worry about losing the original court-ordered plan"),
            ("M2", 35, "the original parenting plan must remain visible")],
    "G-4": [("M1", 83, "I wouldn’t use it if it changed or deleted the original plan"),
            ("M1", 79, "I also wouldn’t want the app to replace or overwrite anything")],
    "G-5": [("M2", 23, "I’d also want the regular parenting plan to remain visible beside any proposed change"),
            ("M2", 25, "I also need the original parenting plan kept alongside every approved change, not replaced by the latest version.")],
    "G-6": [("M1", 41, "any agreed change should be recorded separately while keeping the original court-ordered schedule visible"),
            ("M1", 29, "I keep the court plan separate from any temporary arrangement")],
    "G-7": [("M2", 42, "nothing should appear as agreed unless both parents have confirmed it in writing")],
    "G-8": [("M1", 58, "A change is only something I treat as real once the other parent clearly agrees in writing")],
    "G-9": [("M1", 41, "the parent requesting the change should send it in writing with the reason, proposed date and time")],
    "G-10": [("M2", 29, "I’d expect a clear confirmation that Jason received the request, with the date and time")],
    "G-11": [("M2", 29, "a status showing whether it’s pending, accepted, or declined")],
    "G-12": [("M1", 55, "They’re harder when a message is vague or Jason doesn’t respond promptly")],
    "G-13": [("M1", 24, "Once we agree, the change should be reflected in the calendar"),
             ("M2", 10, "updated promptly when something changes")],
    "G-14": [("M1", 24, "I need a clear confirmation rather than a verbal understanding")],
    "G-15": [("M1", 60, "send a written follow-up if needed")],
    "G-16": [("M2", 42, "a request or silence shouldn’t quietly change the schedule"),
             ("M2", 29, "that should remain visible rather than making the change look approved")],
    "G-17": [("M1", 60, "keep the unanswered request with the date and time it was sent")],
    "G-18": [("M1", 46, "the original court-ordered schedule stays in place unless there’s an emergency or another formal decision")],
    "G-19": [("M2", 17, "The parenting plan says 48 hours’ notice for schedule changes, unless there’s a genuine emergency.")],
    "G-20": [("M2", 17, "48 hours’ notice for schedule changes")],
    "G-21": [("M2", 21, "if one of the children had an accident or a sudden medical issue requiring immediate care, that could justify changing the exchange time")],
    "G-170": [("M1", 41, "For an unexpected sick day, I’d send the message as soon as I know")],
    "G-164": [("M1", 20, "including alternating weekends, holidays, school breaks"),
              ("M1", 29, "to make sure I haven’t missed a holiday or school-break adjustment")],
    "G-166": [("M2", 23, "he treated it as if the whole weekend had automatically changed")],
    "G-167": [("M2", 23, "we had to clarify in writing who was responsible for pickup and when the activity ended")],
    "G-169": [("M2", 29, "If he doesn’t respond within the notice period, that should remain visible")],
    "G-22": [("M2", 19, "It wouldn’t mean a work issue, poor planning, or simply changing one’s mind at the last minute.")],
    "G-25": [("M1", 29, "Reminders would help for upcoming pickups, drop-offs, and notice deadlines.")],
    "G-26": [("M2", 23, "with reminders for the notice deadline and the confirmed exchange time")],
    "G-27": [("M2", 23, "with reminders for the notice deadline and the confirmed exchange time")],
    "G-29": [("M1", 29, "I also need the children’s activities and appointments visible alongside the parenting schedule"),
             ("M1", 71, "I also want the children’s activities and appointments connected to the right exchange")],
    "G-30": [("M1", 74, "I need the schedule, written communication, exchange times, expenses, receipts, and payment records connected")],
    "G-31": [("M1", 79, "the complete written message history"),
             ("M2", 27, "The record should preserve the messages and attachments in their original form")],
    "G-32": [("M1", 55, "I also need the messages organized by child or event")],
    "G-33": [("M1", 77, "I could open one event and see the scheduled time, any written change request, the response, and the actual exchange time")],
    "G-34": [("M1", 31, "I would want the original scheduled time and the actual exchange time preserved")],
    "G-35": [("M2", 27, "I’d need dated timestamps that show when someone arrived and when the exchange actually happened, not just a note one of us typed afterward")],
    "G-36": [("M1", 39, "I record 6:18 and keep the related written message with it")],
    "G-37": [("M1", 35, "The court order limits our contact to written communication about the children")],
    "G-38": [("M2", 23, "The kids shouldn’t have to hear us sorting that out at the door.")],
    "G-39": [("M1", 37, "I make sure the kids’ stuff is ready ahead of time")],
    "G-40": [("M1", 37, "if there’s a delay or change, I send a written message")],
    "G-41": [("M1", 33, "It’s the designated exchange place listed in our parenting plan")],
    "G-42": [("M1", 66, "I send Jason a written reimbursement request")],
    "G-43": [("M1", 64, "I need the category and receipt clear before requesting reimbursement")],
    "G-44": [("M1", 66, "my calculation of his share")],
    "G-45": [("M1", 64, "I need the category and receipt clear before requesting reimbursement")],
    "G-46": [("M1", 66, "I keep the request, receipt, and payment record together")],
    "G-47": [("M1", 66, "if he doesn’t pay or disputes it, I continue the discussion in writing")],
    "G-48": [("M1", 62, "Medical and school expenses are split 50/50 under the parenting plan")],
    "G-49": [("M1", 62, "other costs depend on the category and the order")],
    "G-50": [("M1", 68, "I ask him to explain the disagreement in writing")],
    "G-51": [("M1", 68, "review the receipt and the expense category against the parenting plan")],
    "G-52": [("M1", 68, "keep both his dispute and my response with the request")],
    "G-53": [("M1", 68, "if we still can’t agree, I don’t change the record")],
    "G-54": [("M1", 79, "I need an exportable record in case the court or mediator needs to review it later")],
    "G-55": [("M1", 88, "the export should include the original plan, approved changes, messages, scheduled and actual exchange times, and payment history"),
             ("M2", 40, "not just selected messages")],
    "G-56": [("M2", 27, "a straightforward export that a mediator or court could understand without relying on screenshots from several different apps")],
    "G-57": [("M1", 85, "simple enough that both parents will actually use it")],
    "G-58": [("M2", 31, "the current schedule and any pending change immediately visible without digging through menus")],
    "G-59": [("M2", 31, "The message, calendar, and expense areas should be clearly separated")],
    "G-60": [("M2", 31, "confirming or declining a request shouldn’t take more than a couple of obvious steps")],
    "G-61": [("M2", 31, "if the app shows exactly what action is waiting for him")],
    "G-62": [("M2", 35, "a schedule-only view for my older child"),
             ("M2", 25, "I’d like the older child to be able to see the schedule without being pulled into conversations between Jason and me")],
    "G-63": [("M1", 66, "with the receipt attached, the expense category, my calculation of his share, and a date for payment")],
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
