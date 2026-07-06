export const STAGE_OUTCOMES = {
    New: [
        { label: 'RNR (Ring Not Received)', value: 'RNR', autoTask: 'Call Back: Lead was RNR', offset: 24 },
        { label: 'Busy / Call Later', value: 'Busy', autoTask: 'Call Back: Lead was Busy', offset: 4 },
    ],
    Contacted: [
        { label: 'RNR (Ring Not Received)', value: 'RNR', autoTask: 'Call Back: Lead was RNR', offset: 24 },
        { label: 'Do Not Disturb (DND)', value: 'DND', autoTask: 'Re-engage: Lead requested DND', offset: 720 },
        { label: 'Busy / Call Later', value: 'Busy', autoTask: 'Call Back: Lead was Busy', offset: 4 },
        { label: 'Interested', value: 'Interested', autoTask: 'Follow-up: Interested Lead', requiresDate: true },
    ],
    Qualified: [
        { label: 'Interested / Follow-up', value: 'Interested', autoTask: 'Follow-up: Discuss requirements', requiresDate: true },
        { label: 'Decision Maker Away', value: 'DM_Away', autoTask: 'Call Back: DM was away', offset: 168 },
        { label: 'Info Needed', value: 'Info_Needed', autoTask: 'Prep Info: Lead needs more info', offset: 48 },
    ],
    Proposal: [
        { label: 'Sent - Awaiting', value: 'Sent_Awaiting', autoTask: 'Follow-up: Proposal Sent', offset: 72 },
        { label: 'Pricing Review', value: 'Pricing_Review', autoTask: 'Follow-up: Pricing Discussion', offset: 168 },
        { label: 'Budget Issue', value: 'Budget_Issue', autoTask: 'Re-check: Budget constraints', offset: 360 },
    ],
    Lost: [
        { label: 'Budget Issue', value: 'Budget_Issue', autoTask: 'Re-engage: Re-check budget', offset: 2160 },
        { label: 'Competition', value: 'Competition', autoTask: 'Re-engage: Check relationship', offset: 4320 },
    ],
    Won: []
};