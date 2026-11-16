"""
Combined goal model for the co-parenting schedule and communication app.
Merges goal_model_Melissa.py, goal_model_Jason.py and goal_model_Ruth.py.

Notation
- IDs run G-1 to G-173 across all models. An ID missing from this graph was merged
  into the retained goal listed in MERGE_LOG, whose text was rewritten to keep the
  merged information.
- Yellow nodes are goals not stated in any transcript (see TACIT and missing.json).
- Refinement annotations use only the Appendix A codes. P2 marks an incomplete case
  split; P3 marks a complete one supported by a domain property.
- P2 vs P3: the assignment says "six patterns" but Appendix A has seven codes. The L3 slides
  show one decomposition-by-cases pattern in a complete form (the book's) and an incomplete
  form, and van Lamsweerde's own papers name it both "case-driven" and "decomposition-by-case".
  So P3 marks a complete case split backed by a domain property, and P2 an incomplete one.
- OVERLAPS_KEPT lists similar goals that were reviewed and deliberately not merged.
- CONFLICTS, INCONSISTENCIES and MERGE_LOG document the analysis for Step 2.

Goal type coverage (examples)
- Behavioral: G-8 (Achieve), G-2 (Maintain), G-4 (Avoid), G-28 (Cease)
- Soft: G-1, G-57, G-138
- Functional: G-9, G-85 (satisfaction); G-26, G-89 (stimulus-response); G-145 via G-58 (information)
- Non-functional: G-119 (integrity), G-131 (confidentiality), G-84 (availability), G-60 (usability)
- OR-refinements: G-34, G-85, G-138
"""
import json
import re

from goalmodeling.schema import *
import goal_model_Melissa as melissa
import goal_model_Jason as jason
import goal_model_Ruth as ruth


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


# retained goal: (merged goals, what the rewrite absorbed)
MERGE_LOG = {
    "G-2": (["G-65"], "Jason's 'no changes lost' added to Melissa's 'clear and dependable'"),
    "G-8": (["G-66"], "swaps caused by dispatch are one kind of mutually confirmed change"),
    "G-9": (["G-68"], "alternate date added to reason and proposed date and time"),
    "G-11": (["G-69", "G-79"], "pending status must not imply a refusal or a skipped weekend"),
    "G-14": (["G-70"], "the response carries a reason"),
    "G-16": (["G-72"], "neither a request nor silence changes the calendar"),
    "G-32": (["G-127"], "messages are tied to a specific child-related issue or event"),
    "G-33": (["G-71"], "the event view also keeps the final agreement"),
    "G-34": (["G-124"], "scheduled and actual events are kept distinct"),
    "G-36": (["G-125"], "manual entry happens at or near the time of the event"),
    "G-43": (["G-98"], "purpose and insurance coverage added"),
    "G-44": (["G-99"], "the share follows the plan or what the parents agreed"),
    "G-47": (["G-101"], "a dispute stays open until agreed or resolved"),
    "G-52": (["G-104"], "both positions and the unresolved balance are kept"),
    "G-53": (["G-103"], "the app never changes the amount by itself"),
    "G-57": (["G-91"], "ease of use explicitly includes use on the road"),
    "G-58": (["G-110", "G-145"], "first screen merged across parents and reviewer"),
    "G-108": (["G-136"], "the same record is also the complete case record"),
    "G-116": (["G-30", "G-105"], "one connected, neutral and factual record"),
    "G-121": (["G-107"], "the audit trail shows who changed an entry and when"),
    "G-76": (["G-164"], "holidays and school breaks added to weekends and summer weeks"),
}

# Similar goals that stay separate, and why.
OVERLAPS_KEPT = {
    ("G-31", "G-55"): "G-31 keeps messages in the app; G-55 sets what an export contains",
    ("G-97", "G-111"): "G-97 keeps the data separate; G-111 is the view that shows it, so it refines G-97",
    ("G-121", "G-122", "G-123"): "G-123 is the threat; G-121 and G-122 are how it is avoided, so they refine it",
}

# id: (goal 1, goal 2, type, stakeholders, resolution)
CONFLICTS = {
    "C-1": ("G-37", "G-93", "strong", "Melissa vs Jason",
            "Melissa says the court order limits contact to writing; Jason says a total ban "
            "makes no sense. Transfer outside the system: calls stay outside the app (G-118) "
            "and the actual order terms must be confirmed (G-137)."),
    "C-2": ("G-20", "G-74", "strong", "Melissa vs Jason",
            "The plan requires 48 hours; Jason cannot promise it, and Melissa excludes work "
            "issues from emergencies. Weaken G-74: a late request is allowed but labeled with "
            "the notice given (G-147). It still needs written agreement from both parents."),
    "C-3": ("G-81", "G-119", "weak", "Jason vs Ruth",
            "Jason needs the written time from an offline device; Ruth rejects device clocks. "
            "Server time is authoritative, and the device time is shown as unverified (G-148)."),
    "C-4": ("G-31", "G-109", "weak", "Melissa vs Jason",
            "Melissa wants the full history saved; Jason does not want every conversation to "
            "feel like evidence. Keep the history, but add no scoring or tallies (G-149)."),
    "C-5": ("G-54", "G-133", "strong", "Melissa vs Ruth",
            "Melissa expects to export for a mediator or court; Ruth requires controlled "
            "access granted by both parents or a court order. Export stays complete and is "
            "shared only through a logged authorized grant (G-150)."),
    "C-6": ("G-62", "G-131", "weak", "Melissa vs Ruth",
            "Ruth's authorized participants do not include a child. The child gets a "
            "schedule-only view with no access to the record (G-151)."),
    "C-7": ("G-35", "G-142", "weak", "Melissa vs Ruth",
            "Timestamped arrivals can become ammunition. Capture every exchange the same way "
            "for both parents, with no lateness tallies (G-149)."),
    "C-8": ("G-139", "G-106", "weak", "Ruth vs Jason",
            "A hostile-tone warning could read as a judgment. It is private to the sender and "
            "never enters the record (G-152)."),
}

INCONSISTENCIES = {
    "I-1": "Melissa says the schedule yields to an emergency (M1 line 46) but also that nothing "
           "appears agreed without both confirmations (M2 line 42). G-153 keeps an emergency "
           "override separate from an agreed change.",
    "I-2": "Melissa's 48 hours is 'when possible' (M1 line 41) versus a firm rule (M2 line 17); "
           "the emergency case is the unstated condition (G-20, G-21).",
    "I-3": "Melissa describes typed actual times (M1 line 39) but later rejects them as the only "
           "evidence (M2 line 27). Modeled as an OR-refinement of G-34.",
    "I-4": "Melissa wants separated areas (M2 line 31) and one connected event (M1 line 77). "
           "Both hold if areas stay separate and related items link to each other.",
    "I-5": "Melissa treats an unexpected sick day as an exception (M1 line 41), but her emergency "
           "definition needs immediate care (M2 lines 21, 33). Unstated condition: an ordinary "
           "illness shortens the notice without being an emergency, so it is its own case (G-170).",
    "I-6": "Jason wants reasonable notice for requests he receives (J2 line 20) but cannot promise "
           "48 hours on requests he sends (J2 line 18). G-168 and G-74 keep both; C-2 covers the rest.",
}

# ---- Original plan -------------------------------------------------------------
g4 = AvoidGoal("G-4: OriginalPlanChangedOrDeleted", sw("ScheduleService"), leaf=True)
g5 = MaintainGoal("G-5: OriginalPlanShownBesideAnyProposedChange", sw("ScheduleService"), leaf=True)
g6 = MaintainGoal("G-6: AgreedChangesRecordedSeparatelyFromOriginal", sw("ScheduleService"), leaf=True)
g3 = MaintainGoal("G-3: OriginalCourtPlanPreservedAndVisible", refinements=[
    Refinement(True, [g4, g5, g6], annotation="H4")])

# ---- Change agreement ----------------------------------------------------------
g67 = AchieveGoal("G-67: PickupFeasibilityChecked <b>If</b> RouteChanged", env("Parent"), leaf=True)
g9 = AchieveGoal("G-9: RequestSentInWritingWithReasonProposedDateTimeAndAlternateDate<br/><b>If</b> ChangeNeeded",
                 env("Parent"), leaf=True)
g10 = AchieveGoal("G-10: ReceiptConfirmedWithDateTime <b>If</b> RequestSent", sw("MessagingService"), leaf=True)
g11 = MaintainGoal("G-11: RequestShownPendingAcceptedOrDeclinedUntilBothAgree<br/>WithoutImplyingRefusalOrSkippedTime",
                   sw("ScheduleService"), leaf=True)
g14 = AchieveGoal("G-14: RespondingParentAcceptsOrDeclinesInWritingWithReason<br/><b>If</b> RequestPending",
                  env("Parent"), leaf=True)
g15 = AchieveGoal("G-15: WrittenFollowUpSent <b>If</b> NoReply", env("Parent"), leaf=True)
g73 = AchieveGoal("G-73: AlternativeSuggested <b>If</b> RequestNotWorkable", env("Parent"), leaf=True)
g12 = AchieveGoal("G-12: WrittenResponseObtained <b>If</b> RequestSent", refinements=[
    Refinement(False, [g14, g15, g73], annotation="P7")])
g160 = AchieveGoal("G-160: CalendarUpdatedImmediately <b>If</b> SecondConfirmationStored", sw("ScheduleService"), leaf=True)
g13 = AchieveGoal("G-13: CalendarUpdatedPromptly <b>If</b> ChangeAccepted", refinements=[
    Refinement(False, [g160], annotation="H4")])
g8 = AchieveGoal("G-8: ScheduleChangedOrSwapped <b>If</b> BothParentsConfirmInWriting", refinements=[
    Refinement(False, [g67, g9, g10, g12, g13], annotation="P1")])

g17 = MaintainGoal("G-17: UnansweredRequestKeptWithSentDateTime", sw("MessagingService"), leaf=True)
g169 = AchieveGoal("G-169: RequestMarkedOverdue <b>If</b> NoResponseWithinNoticePeriod", sw("ScheduleService"), leaf=True)
g18 = MaintainGoal("G-18: OriginalScheduleInForce<br/><b>If</b> NotAgreed <b>And</b> NoEmergencyOrFormalDecision",
                   sw("ScheduleService"), leaf=True)
g153 = MaintainGoal("G-153: EmergencyOverrideShownSeparatelyFromAgreedChange", sw("ScheduleService"), leaf=True)
g16 = AvoidGoal("G-16: RequestOrSilenceChangesCalendarOrShowsAsAgreed", refinements=[
    Refinement(False, [g11, g17, g169, g18, g153], annotation="H8")])
g7 = MaintainGoal("G-7: OnlyMutuallyConfirmedChangesTreatedAsAgreed", refinements=[
    Refinement(True, [g8, g16], annotation="H10")])

# ---- Notice --------------------------------------------------------------------
dp1 = DomainProperty("Each change request is a genuine emergency,<br/>an unexpected child illness, or neither", leaf=True)
g20 = AchieveGoal("G-20: RequestSent48HoursAhead <b>If</b> NoEmergencyOrUnexpectedIllness", env("Parent"), leaf=True)
g21 = AchieveGoal("G-21: RequestSentAsSoonAsKnown <b>If</b> GenuineEmergency", env("Parent"), leaf=True)
g170 = AchieveGoal("G-170: RequestSentAsSoonAsKnown <b>If</b> UnexpectedChildIllness", env("Parent"), leaf=True)
g19 = AchieveGoal("G-19: RequiredNoticeGivenForScheduleChange", refinements=[
    Refinement(True, [dp1, g20, g21, g170], annotation="P3")])

g147 = AchieveGoal("G-147: LateRequestLabeledWithActualNoticeGiven <b>If</b> LessThan48Hours",
                   sw("ScheduleService"), leaf=True)
g74 = MaintainGoal("G-74: AsMuchNoticeGivenAsActuallyAvailable", env("Parent"), leaf=True)
g168 = AvoidGoal("G-168: AnswerExpectedWithAlmostNoNotice", env("Parent"), leaf=True)

dp2 = DomainProperty("GenuineEmergency <b>Iff</b> Unexpected, Serious, InvolvesChildren,<br/>AndWaitingCreatesRealProblem",
                     leaf=True)
g23 = AchieveGoal("G-23: EmergencyReasonStatedInRequest <b>If</b> EmergencyClaimed", env("Parent"), leaf=True)
g24 = AchieveGoal("G-24: EmergencyClaimContestedInWriting <b>If</b> OtherParentDisagrees", env("Parent"), leaf=True)
g22 = AvoidGoal("G-22: WorkOrPlanningIssueTreatedAsEmergency", refinements=[
    Refinement(False, [dp2, g23, g24], annotation="P6")])

# ---- Reminders and calendar content --------------------------------------------
g26 = AchieveGoal("G-26: ReminderSent <b>If</b> ConfirmedExchangeUpcoming", sw("NotificationService"), leaf=True)
g27 = AchieveGoal("G-27: ReminderSent <b>If</b> NoticeDeadlineUpcoming", sw("NotificationService"), leaf=True)
g28 = CeaseGoal("G-28: ExchangeReminders <b>If</b> ExchangeCancelledOrRescheduled",
                sw("NotificationService"), leaf=True)
g25 = AchieveGoal("G-25: ParentRemindedOfExchangesAndNoticeDeadlines", refinements=[
    Refinement(False, [g26, g27, g28], annotation="H9")])
g29 = MaintainGoal("G-29: ChildActivitiesAndAppointmentsShownWithConnectedExchange",
                   sw("ScheduleService"), leaf=True)
g75 = AchieveGoal("G-75: PickupTimesPlaceAndActivitiesConfirmedBeforeWeekend", env("Parent"), leaf=True)
g76 = MaintainGoal("G-76: AlternatingWeekendsHolidaysSchoolBreaksAndSummerWeeksShownInSchedule",
                   sw("ScheduleService"), leaf=True)
g166 = AvoidGoal("G-166: ActivityNoticeTreatedAsScheduleChange", sw("ScheduleService"), leaf=True)
g167 = AchieveGoal("G-167: NoticeStatesWhoHandlesPickupAndActivityEndTime<br/><b>If</b> ActivityOverlapsExchange",
                   env("Parent"), leaf=True)

g2 = MaintainGoal("G-2: CustodyScheduleClearDependableAndNoChangesLost", refinements=[
    Refinement(False, [g3, g7, g19, g74, g147, g168, g22, g25, g29, g166, g167, g75, g76], annotation="H4")])

# ---- Reliable, neutral record --------------------------------------------------
g119 = MaintainGoal("G-119: EntriesTimestampedByTrustedServer", sw("TimeService"), leaf=True)
g148 = MaintainGoal("G-148: DeviceWrittenTimeLabeledUnverified", sw("MobileClient"), leaf=True)
g120 = MaintainGoal("G-120: EachEntryAttributedToItsAuthor", sw("RecordService"), leaf=True)
g121 = MaintainGoal("G-121: AuditTrailShowsOriginalEntryWhoChangedItAndWhen", sw("RecordService"), leaf=True)
g122 = MaintainGoal("G-122: ChangedOrDeletedMaterialStaysVisibleAsChanged", sw("RecordService"), leaf=True)
g123 = AvoidGoal("G-123: ParentQuietlyAltersHistory", refinements=[
    Refinement(False, [g121, g122], annotation="H4")])
g126 = MaintainGoal("G-126: MessageShownWithSurroundingContext", sw("RecordService"), leaf=True)
g117 = MaintainGoal("G-117: RecordCompleteTimestampedAttributableAndConsistent", refinements=[
    Refinement(False, [g119, g120, g123, g126], annotation="P5")])

g31 = MaintainGoal("G-31: CompleteMessageHistoryPreservedInOriginalForm", sw("MessagingService"), leaf=True)
g32 = MaintainGoal("G-32: MessagesTiedToSpecificChildOrEventIssue", sw("MessagingService"), leaf=True)
g33 = MaintainGoal("G-33: OneEventShowsScheduledTimeRequestResponseAgreementAndActualTime",
                   sw("ScheduleService"), leaf=True)
g35 = AchieveGoal("G-35: ArrivalAndExchangeTimestampedAtTheExchange", sw("ExchangeLog"), leaf=True)
g36 = AchieveGoal("G-36: ActualTimeEnteredAtOrNearTheTimeWithRelatedMessage", env("Parent"), leaf=True)
g34 = MaintainGoal("G-34: ScheduledAndActualExchangeTimesPreservedAndDistinguished", refinements=[
    Refinement(False, [g35], annotation="P6"),   # OR alternative 1
    Refinement(False, [g36], annotation="P6")])  # OR alternative 2

g128 = MaintainGoal("G-128: ExpenseViewConnectsChildDateAmountReceiptAndResponses", sw("ExpenseLedger"), leaf=True)
g129 = MaintainGoal("G-129: ExpenseStatusShownAsRequestedApprovedPaidReimbursedOrDisputed",
                    sw("ExpenseLedger"), leaf=True)
g130 = MaintainGoal("G-130: ExpenseShowsWhoPaidAndWhetherAgreedInAdvance", sw("ExpenseLedger"), leaf=True)

g106 = AvoidGoal("G-106: RecordJudgesOrLabelsAParent", sw("RecordService"), leaf=True)
g149 = AvoidGoal("G-149: ParentBehaviorScoresOrLatenessTallies", sw("RecordService"), leaf=True)
g109 = SoftGoal("G-109: Minimize[RoutineCoordinationFeelingLikeFormalEvidence]", refinements=[
    Refinement(False, [g149], annotation="H8")])
g154 = MaintainGoal("G-154: RecordNotExposedOutsideAuthorizedParticipants", sw("RecordService"), leaf=True)
g155 = MaintainGoal("G-155: RecordBackedUpAndAvailable", sw("RecordService"), leaf=True)
g156 = MaintainGoal("G-156: RecordSecureAndAvailable", refinements=[
    Refinement(False, [g154, g155], annotation="H3")])

g116 = MaintainGoal("G-116: SingleNeutralFactualConnectedRecordSharedByParentsAndCourt", refinements=[
    Refinement(False, [g117, g31, g32, g33, g34, g128, g129, g130, g106, g156], annotation="P5")])
g113 = SoftGoal("G-113: Reduce[RoutineDisagreementsReachingJudge]", refinements=[
    Refinement(False, [g116], annotation="H12")])

# ---- Written contact and handoffs ----------------------------------------------
dp3 = DomainProperty("CourtOrderLimitsContactToWrittenMessagesAboutChildren", leaf=True)
g37 = MaintainGoal("G-37: ParentContactKeptInWriting", env("Parent"), leaf=True)
g39 = AchieveGoal("G-39: ChildItemsReadyBeforeExchange", env("Parent"), leaf=True)
g40 = AchieveGoal("G-40: DelayOrChangeMessagedInWriting <b>If</b> ExchangeAffected", env("Parent"), leaf=True)
g41 = MaintainGoal("G-41: DesignatedExchangeLocationShown", sw("ScheduleService"), leaf=True)
g38 = AchieveGoal("G-38: HandoffWithoutArguingInFrontOfChildren", refinements=[
    Refinement(False, [g39, g40, g41], annotation="H4")])

# ---- Expenses ------------------------------------------------------------------
g43 = AchieveGoal("G-43: ExpenseRecordedWithCategoryReceiptPurposeAndInsuranceCoverage", env("Parent"), leaf=True)
g63 = AchieveGoal("G-63: RequestIncludesReceiptCategoryShareAndPaymentDate", env("Parent"), leaf=True)
g45 = AchieveGoal("G-45: ReimbursementRequested <b>If</b> CategoryAndReceiptClear", refinements=[
    Refinement(False, [g43, g63], annotation="P4")])
dp4 = DomainProperty("Each expense is medical/school or another category", leaf=True)
g48 = AchieveGoal("G-48: Split50-50 <b>If</b> MedicalOrSchoolExpense", sw("ExpenseLedger"), leaf=True)
g49 = AchieveGoal("G-49: SplitPerParentingPlan <b>If</b> OtherCategory", sw("ExpenseLedger"), leaf=True)
g44 = AchieveGoal("G-44: ParentShareCalculatedAsPlanOrParentsAgreed", refinements=[
    Refinement(True, [dp4, g48, g49], annotation="P3")])
g46 = AchieveGoal("G-46: PaymentRecordedWithRequestAndReceipt", sw("ExpenseLedger"), leaf=True)
g50 = AchieveGoal("G-50: DisagreementExplainedInWriting <b>If</b> CalculationDisputed", env("Parent"), leaf=True)
g51 = AchieveGoal("G-51: ReceiptAndCategoryReviewedAgainstPlan <b>If</b> CalculationDisputed", env("Parent"), leaf=True)
g52 = MaintainGoal("G-52: BothPositionsResponseAndUnresolvedBalanceKeptWithRequest", sw("ExpenseLedger"), leaf=True)
g53 = AvoidGoal("G-53: AmountOrRecordChanged <b>If</b> DisputeUnresolved", sw("ExpenseLedger"), leaf=True)
g102 = AvoidGoal("G-102: DisputedAmountAddedToOwedBalance", sw("ExpenseLedger"), leaf=True)
g47 = AchieveGoal("G-47: DisputeHandledInWritingAndOpenUntilAgreedOrResolved<br/><b>If</b> CalculationDisputed",
                  refinements=[Refinement(False, [g50, g51, g52, g53, g102], annotation="H4")])
g100 = MaintainGoal("G-100: RunningBalanceShowsPaidAndOwed", sw("ExpenseLedger"), leaf=True)
g111 = MaintainGoal("G-111: ExpensesViewSeparatesAgreedDisputedAndChildSupport", sw("MobileClient"), leaf=True)
g97 = AvoidGoal("G-97: ChildSupportMixedWithSharedExpenses", refinements=[
    Refinement(False, [g111], annotation="H4")])
g42 = AchieveGoal("G-42: ChildExpensesReimbursed", refinements=[
    Refinement(False, [g44, g45, g46], annotation="P1")])
g96 = MaintainGoal("G-96: SharedExpensesFair", refinements=[
    Refinement(False, [g128, g43, g44, g97, g100], annotation="H4")])

# ---- Export --------------------------------------------------------------------
g55 = MaintainGoal("G-55: ExportIncludesFullHistoryNotSelectedMessages", sw("ExportService"), leaf=True)
g162 = MaintainGoal("G-162: ExportPresentedAsSingleChronologicalTimeline", sw("ExportService"), leaf=True)
g56 = MaintainGoal("G-56: ExportUnderstandableWithoutScreenshots", refinements=[
    Refinement(False, [g162], annotation="H4")])
g150 = MaintainGoal("G-150: ExportCompleteAndSharedOnlyThroughLoggedAuthorizedGrant", sw("AccessControl"), leaf=True)
g54 = AchieveGoal("G-54: CompleteRecordExported <b>If</b> MediatorOrCourtReviewNeeded", refinements=[
    Refinement(False, [g55, g56, g150], annotation="H5")])

# ---- Ease of use and child view ------------------------------------------------
g58 = MaintainGoal("G-58: FirstScreenShowsCurrentScheduleUpcomingExchangesPendingChange<br/>AndPickupTimesAndLocations",
                   sw("MobileClient"), leaf=True)
g59 = MaintainGoal("G-59: MessageCalendarExpenseAreasClearlySeparated", sw("MobileClient"), leaf=True)
g161 = MaintainGoal("G-161: ConfirmOrDeclineWithinTwoTapsFromFirstScreen", sw("MobileClient"), leaf=True)
g60 = MaintainGoal("G-60: ConfirmOrDeclineInCoupleOfObviousSteps", refinements=[
    Refinement(False, [g161], annotation="H4")])
g61 = MaintainGoal("G-61: WaitingActionShownToParent", sw("MobileClient"), leaf=True)
g92 = AvoidGoal("G-92: TypingRequiredWhileDriving", sw("MobileClient"), leaf=True)
g57 = SoftGoal("G-57: Increase[EaseOfUseForBothParentsIncludingOnTheRoad]", refinements=[
    Refinement(False, [g58, g59, g60, g61, g92], annotation="H3")])
g151 = MaintainGoal("G-151: ChildViewExcludesMessagesExpensesAndHistory", sw("AccessControl"), leaf=True)
g62 = MaintainGoal("G-62: OlderChildSeesScheduleOnly", refinements=[
    Refinement(False, [g151], annotation="H8")])

g1 = SoftGoal("G-1: Minimize[ConflictInFrontOfChildren]", refinements=[
    Refinement(False, [g2, g116, dp3, g37, g38, g42, g47, g96, g54, g57, g62], annotation="H7")])

# ---- Not looking absent --------------------------------------------------------
g157 = AchieveGoal("G-157: OutcomeShownAsHappened <b>If</b> ExchangeCompleted", sw("ScheduleService"), leaf=True)
g158 = AchieveGoal("G-158: OutcomeShownAsSwapped <b>If</b> SwapAgreed", sw("ScheduleService"), leaf=True)
g159 = AchieveGoal("G-159: OutcomeShownAsChangedForWork <b>If</b> DispatchChangedRoute", sw("ScheduleService"), leaf=True)
g78 = MaintainGoal("G-78: WeekendOutcomeShownAsHappenedSwappedOrChangedForWork", refinements=[
    Refinement(False, [g157, g158, g159], annotation="P2")])
g81 = AchieveGoal("G-81: WrittenTimeCaptured <b>If</b> MessageComposed", sw("MobileClient"), leaf=True)
g82 = AchieveGoal("G-82: SentTimeRecorded <b>If</b> MessageTransmitted", sw("MessagingService"), leaf=True)
g83 = AchieveGoal("G-83: DeliveredAndReadStatusShown", sw("MessagingService"), leaf=True)
g80 = MaintainGoal("G-80: MessagesReflectRealTiming", refinements=[
    Refinement(False, [g81, g148, g82, g83], annotation="H11")])
g77 = AvoidGoal("G-77: AppearingToHaveSkippedTimeOrIgnoredMessage", refinements=[
    Refinement(False, [g78, g80], annotation="H4")])

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

# ---- Working on the road and urgent contact ------------------------------------
g84 = MaintainGoal("G-84: MessageSavedWhileOutOfCoverage", sw("MobileClient"), leaf=True)
g90 = MaintainGoal("G-90: AppWorksWithPoorOrNoSignal", refinements=[
    Refinement(False, [g84], annotation="H3")])
g118 = AchieveGoal("G-118: UrgentCallMadeOutsideAppAndFollowedByWrittenNote <b>If</b> OrderPermits",
                   env("Parent"), leaf=True)
g137 = AchieveGoal("G-137: CourtOrderTermsOnUrgentCallsConfirmed", env("Mediator"), leaf=True)
g93 = AchieveGoal("G-93: UrgentCallPossible<br/><b>If</b> IssueCannotReasonablyWait", refinements=[
    Refinement(False, [g118, g137], annotation="H8")])
g172 = MaintainGoal("G-172: NonUrgentDisagreementsRaisedInWriting", env("Parent"), leaf=True)
g94 = AvoidGoal("G-94: EveryDisagreementTurnsIntoCall", refinements=[
    Refinement(False, [g172], annotation="P7")])
g95 = MaintainGoal("G-95: AbilityToCallKeptForUrgentIssues", refinements=[
    Refinement(False, [g93, g94], annotation="H6")])

g64 = SoftGoal("G-64: Maximize[InvolvementWithChildrenDespiteRoadSchedule]", refinements=[
    Refinement(False, [g2, g77, g85, g90, g95, g109], annotation="H7")])

# ---- Access, tone and review ---------------------------------------------------
g132 = AvoidGoal("G-132: AccessViaGeneralLinkOrAnotherCase", sw("AccessControl"), leaf=True)
g133 = AchieveGoal("G-133: ReviewerGrantedCaseSpecificAccess<br/><b>If</b> BothParentsConsentOrCourtOrder",
                   sw("AccessControl"), leaf=True)
g134 = MaintainGoal("G-134: ReviewerAccessReadOnly", sw("AccessControl"), leaf=True)
g114 = AchieveGoal("G-114: ReviewerReadsCaseRecord <b>If</b> AccessGranted", refinements=[
    Refinement(True, [g133, g134], annotation="P4")])
g135 = CeaseGoal("G-135: ReviewerAccess <b>If</b> GrantRevokedOrExpired", sw("AccessControl"), leaf=True)
g108 = MaintainGoal("G-108: BothParentsSeeSameCompleteCaseRecord", sw("AccessControl"), leaf=True)
g165 = AchieveGoal("G-165: LegalRepresentativeGrantedCaseAccess <b>If</b> Authorized", sw("AccessControl"), leaf=True)
g131 = MaintainGoal("G-131: AccessLimitedToAuthorizedCaseParticipants", refinements=[
    Refinement(False, [g132, g114, g135, g108, g165], annotation="H10")])

g152 = MaintainGoal("G-152: ToneWarningPrivateToSenderAndOutsideRecord", sw("MessagingService"), leaf=True)
g163 = AchieveGoal("G-163: MessageFlagged <b>If</b> ContainsInsultAccusationThreatOrMotiveSpeculation",
                   sw("MessagingService"), leaf=True)
g139 = AchieveGoal("G-139: OptionalToneWarningShown <b>If</b> MessageAppearsHostile", refinements=[
    Refinement(False, [g152, g163], annotation="H8")])
g140 = AvoidGoal("G-140: AppBlocksOrRewritesMessage", sw("MessagingService"), leaf=True)
g141 = AchieveGoal("G-141: NeutralChildFocusedTemplateOffered <b>If</b> ParentComposesRequest",
                   sw("MessagingService"), leaf=True)
g138 = SoftGoal("G-138: Reduce[HostileCommunication]", refinements=[
    Refinement(False, [g139, g140], annotation="H6"),   # OR alternative 1
    Refinement(False, [g141, g140], annotation="H6")])  # OR alternative 2

g171 = MaintainGoal("G-171: EntriesCreatedOnlyAgainstChildRelatedIssueOrEvent", sw("RecordService"), leaf=True)
g143 = AvoidGoal("G-143: CollectingIncidentsEasierThanCommunicating", refinements=[
    Refinement(False, [g149, g171], annotation="H4")])
g142 = AvoidGoal("G-142: AppUsedToCollectAmmunition", refinements=[
    Refinement(False, [g143], annotation="H8")])

g146 = AchieveGoal("G-146: RecentChangesUnresolvedExpensesAndMessagesShownTogether", sw("RecordService"), leaf=True)
g144 = SoftGoal("G-144: Increase[EaseOfRecordReview]", refinements=[
    Refinement(False, [g58, g146], annotation="H4")])

g112 = SoftGoal("G-112: Maximize[MediationFocusedOnChildrenNotCompetingEvidence]", refinements=[
    Refinement(False, [g113, g131, g138, g142, g144], annotation="H7")])

# ---- Root ----------------------------------------------------------------------
g115 = SoftGoal("G-115: Maximize[ChildFocusedCoParentingWithRecordCourtCanTrust]", refinements=[
    Refinement(False, [g1, g64, g112], annotation="H12")])

# ---- Obstacles (H8) ------------------------------------------------------------
o1 = Obstacle("O-1: ParentDoesNotRespondPromptly")
o2 = Obstacle("O-2: DispatchChangesRouteInsideNoticeWindow")
o3 = Obstacle("O-3: ScreenshotsOmitMessagesOrContext")
o4 = Obstacle("O-4: DeviceClockWrong")
o5 = Obstacle("O-5: AppTooComplicatedSoParentRefusesIt")

LINKS = [
    ConflictLink(g37, g93),    # C-1
    ConflictLink(g20, g74),    # C-2
    ConflictLink(g81, g119),   # C-3
    ConflictLink(g31, g109),   # C-4
    ConflictLink(g54, g133),   # C-5
    ConflictLink(g62, g131),   # C-6
    ConflictLink(g35, g142),   # C-7
    ConflictLink(g139, g106),  # C-8
    ObstructionLink(g12, o1), ResolutionLink(g15, o1),
    ObstructionLink(g20, o2), ResolutionLink(g147, o2),
    ObstructionLink(g116, o3), ResolutionLink(g55, o3),
    ObstructionLink(g119, o4), ResolutionLink(g148, o4),
    ObstructionLink(g57, o5), ResolutionLink(g60, o5),
]

ROOT = g115
TACIT = {
    "G-23": g23, "G-24": g24, "G-28": g28, "G-86": g86, "G-88": g88, "G-92": g92,
    "G-135": g135, "G-141": g141, "G-118": g118, "G-137": g137, "G-147": g147,
    "G-148": g148, "G-149": g149, "G-150": g150, "G-151": g151, "G-152": g152,
    "G-153": g153, "G-155": g155, "G-156": g156, "G-160": g160, "G-161": g161, "G-162": g162,
    "G-171": g171, "G-172": g172, "G-173": g173,
}

# Source quotes come from the stakeholder models, so there is one copy of each.
TRACE = {**melissa.TRACE, **jason.TRACE, **ruth.TRACE}
for kept, (merged, _) in MERGE_LOG.items():
    for goal_id in merged:
        TRACE[kept] = TRACE[kept] + TRACE.pop(goal_id)
TRACE["G-154"] = [("R1", 69, "if one parent believes the other can selectively edit, delete, or expose records")]
TRACE["G-115"] = [("R1", 81, "I hope the system keeps parents focused on their children and gives the court a record it can trust.")]


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
    ids = ",".join(goal.get_node_id() for goal in goals if goal.get_node_id() + "[" in output)
    marked = f"class {ids} missing\n" if ids else ""
    return output + ("\nclassDef stroke stroke-dasharray: 5 5,fill:#ffffff,fill-opacity:1,color:#000\n"
                     f"classDef missing fill:#ffff00,color:#000\n{marked}")


def build():
    return STYLE + wrap_labels(highlight(generate_graph([ROOT], LINKS), TACIT.values()))


SUBTREES = {
    "schedule": [g2],
    "record": [g116],
    "expenses": [g42, g47, g96],
    "access and export": [g131, g54, g62],
    "road, messages and urgent contact": [g77, g85, g90, g95],
    "tone, misuse and review": [g138, g142, g144],
}


def subtree_links():
    """One readable Mermaid link for each major branch of the combined model."""
    links = {}
    for name, roots in SUBTREES.items():
        text = STYLE + wrap_labels(highlight(generate_graph(roots, []), TACIT.values()))
        links[name] = generate_pako_link(text, "edit", config=CONFIG)
    return links


def link(mode="edit"):
    return generate_pako_link(build(), mode, config=CONFIG)


if __name__ == "__main__":
    print(build())
    print(link())
