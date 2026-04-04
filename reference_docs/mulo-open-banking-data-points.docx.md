**Open Banking & Open Finance**

**Data Points for Personalised Financial Education**

Complete inventory of available data signals mapped to Mulo’s learning curriculum

*Version 1.0  |  March 2026  |  Internal Reference Document*

# **How to Read This Document**

Each section below catalogues the data points available from a specific Open Banking or Open Finance data source. For every data point we list: the **Source** (where the data comes from), **Availability** (whether it’s accessible now via UK Open Banking AISP APIs, partially available, or a future Open Finance capability), the **Learning Areas** it supports within Mulo’s curriculum, and the **Educational Application** explaining exactly how it will be used to personalise lessons.

Availability key: **Now** \= accessible today via TrueLayer/Finexer AISP APIs. **Partial** \= available for some providers or requires inference logic. **Limited** \= available from select platforms only. **Future** \= dependent on Pensions Dashboards or broader Open Finance regulation.

Important: In line with Mulo’s data principles, **raw transaction data is never stored**. All data points listed as “derived” are calculated in real-time or as aggregated signals, and the underlying transaction detail is discarded after processing.

## **1\. Income & Earnings**

Income data forms the foundation of almost every personalised lesson. Detecting income amount, regularity, and source allows Mulo to calibrate budgeting rules, savings targets, tax education, and pension contribution guidance to the user’s actual financial reality.

| Data Point | Source | Availability | Learning Areas | Educational Application |
| :---- | :---- | :---- | :---- | :---- |
| **Monthly net income amount** | AISP Transactions | Now | Budgeting, Saving | Anchor for all % rules (50/30/20), savings targets, affordability calculations |
| **Income frequency / regularity** | AISP Transactions | Now | Budgeting, Employment | Distinguishes salaried vs irregular income; adapts budgeting lessons accordingly |
| **Income source type** | AISP Transactions (derived) | Now | Tax, Employment | Identifies salary, self-employment, benefits, rental income; routes to relevant tax lessons |
| **Multiple income streams** | AISP Transactions (derived) | Now | Tax, Budgeting | Flags side hustles/freelance income; triggers lessons on tax returns, diversification |
| **Payday date detection** | AISP Transactions (derived) | Now | Budgeting | Personalises cash flow lessons to the user’s actual pay cycle |
| **Income trend (3–12 months)** | AISP Transactions (derived) | Now | Career, Saving | Growing vs stagnant income feeds into salary negotiation, pension contribution lessons |
| **Employer name** | AISP Transaction reference | Now | Pensions, Benefits | Identifies employer pension scheme, workplace benefits education opportunities |
| **Bonus / irregular payment detection** | AISP Transactions (derived) | Now | Saving, Tax, Investing | Triggers lessons on windfall management, ISA lump sums, tax-efficient saving |

## **2\. Spending & Outgoings**

Transaction-level spending data is the richest source of personalisation signals. By categorising spend and detecting patterns, Mulo can identify specific areas where education will have the most impact — from subscription audits to impulse spending awareness. This powers the majority of “Apply to My Money” calculations.

| Data Point | Source | Availability | Learning Areas | Educational Application |
| :---- | :---- | :---- | :---- | :---- |
| **Total monthly expenditure** | AISP Transactions | Now | Budgeting | Core metric for budget health score, income-to-expenditure ratio |
| **Spending by category (auto-tagged)** | AISP Transactions \+ MCC | Now | Budgeting | Enables personalised spend breakdowns; highlights over/underspend vs benchmarks |
| **Essential vs discretionary split** | AISP Transactions (derived) | Now | Budgeting | Powers needs/wants/savings framework; teaches spending prioritisation |
| **Rent / housing cost amount** | AISP Transactions (derived) | Now | Housing, Budgeting | Housing affordability ratio; triggers mortgage readiness or rent-to-income lessons |
| **Grocery spend** | AISP Transactions \+ MCC | Now | Budgeting | Comparison to national averages; meal planning and food budget lessons |
| **Transport spend** | AISP Transactions \+ MCC | Now | Budgeting | Car vs public transport cost comparison; commuting cost optimisation lessons |
| **Eating out / takeaway spend** | AISP Transactions \+ MCC | Now | Budgeting | Discretionary spending awareness; small changes compound lessons |
| **Entertainment / leisure spend** | AISP Transactions \+ MCC | Now | Budgeting | Lifestyle inflation awareness; values-based spending lessons |
| **Subscription detection** | AISP Transactions (pattern) | Now | Budgeting, Saving | Identifies recurring charges; powers subscription audit and cancellation savings lessons |
| **Subscription count and total cost** | AISP Transactions (derived) | Now | Budgeting | Aggregate subscription burden; “hidden cost” awareness lessons |
| **Council tax amount** | AISP Transactions (derived) | Now | Housing, Tax | Infers council tax band and region; relevant for property and tax education |
| **Utility payments (energy, water, broadband)** | AISP Transactions (derived) | Now | Budgeting, Housing | Bill comparison education; switching and negotiation lessons |
| **Childcare / school fee payments** | AISP Transactions (derived) | Now | Family Finance | Triggers childcare voucher, tax-free childcare, and family budget lessons |
| **Insurance premium payments** | AISP Transactions (derived) | Now | Protection | Identifies existing cover; feeds into protection gap and insurance review lessons |
| **Gambling spend detection** | AISP Transactions \+ MCC | Now | Wellbeing, Budgeting | Flags potential problem gambling; sensitive signposting to support resources |
| **BNPL payment detection** | AISP Transactions (pattern) | Now | Debt, Budgeting | Identifies buy-now-pay-later obligations; triggers hidden debt and credit impact lessons |
| **Cash withdrawals frequency/amount** | AISP Transactions | Now | Budgeting | Tracks untracked spending; lessons on cash tracking and full-picture budgeting |
| **Spending velocity (daily rate)** | AISP Transactions (derived) | Now | Budgeting | Payday-to-payday pacing; teaches users to smooth spending across the month |
| **Merchant frequency (top merchants)** | AISP Transactions (derived) | Now | Budgeting | Habitual spending awareness; loyalty vs switching education |
| **Seasonal spending patterns** | AISP Transactions (12mo derived) | Now | Budgeting, Saving | Christmas, holiday, back-to-school spikes; sinking fund and planning lessons |

## **3\. Savings & Cash Reserves**

Savings account data reveals the user’s progress toward financial resilience and their use of tax-efficient wrappers. This drives emergency fund education, ISA strategy lessons, and savings habit formation content.

| Data Point | Source | Availability | Learning Areas | Educational Application |
| :---- | :---- | :---- | :---- | :---- |
| **Total savings balance (all accounts)** | AISP Accounts | Now | Saving | Core savings health metric; emergency fund adequacy assessment |
| **Savings account types held** | AISP Accounts | Now | Saving, Tax | Maps ISA vs non-ISA; identifies tax-efficient saving opportunities |
| **Cash ISA balance** | AISP Accounts | Now | Saving, Tax | ISA allowance utilisation; Cash ISA vs S\&S ISA lessons |
| **Stocks & Shares ISA balance** | AISP Accounts | Now | Investing, Tax | Investment ISA education; risk tolerance and asset allocation lessons |
| **Lifetime ISA balance** | AISP Accounts | Now | Housing, Retirement | LISA bonus tracking; first home vs retirement decision lessons |
| **ISA allowance utilisation** | AISP Accounts (derived) | Now | Saving, Tax | Remaining annual allowance; use-it-or-lose-it education |
| **Savings rate (% of income saved)** | AISP Derived | Now | Saving, Budgeting | Key financial health metric; benchmarking and goal-setting lessons |
| **Savings momentum (trend direction)** | AISP Derived (3–12mo) | Now | Saving | Growing/shrinking/flat trajectory; motivational and corrective education |
| **Emergency fund months covered** | AISP Derived | Now | Saving | Months of essential expenses covered; risk buffer and resilience lessons |
| **Monthly savings deposit regularity** | AISP Transactions (pattern) | Now | Saving | Detects pay-yourself-first behaviour; standing order and automation lessons |
| **Savings interest rate (where exposed)** | AISP Account data | Partial | Saving | Rate comparison education; best-buy savings account awareness |
| **Fixed-term savings / notice accounts** | AISP Accounts | Now | Saving | Maturity date awareness; laddering and access trade-off lessons |
| **Savings goal progress** | User input \+ AISP | Now | Saving | Goal tracking against user-defined targets; milestone celebration and recalibration |

## **4\. Debt & Credit**

Debt data enables Mulo to teach users about their actual debt position rather than abstract concepts. Credit utilisation, repayment behaviour, and debt-to-income ratios feed directly into personalised debt management and credit score education.

| Data Point | Source | Availability | Learning Areas | Educational Application |
| :---- | :---- | :---- | :---- | :---- |
| **Credit card balance(s)** | AISP Accounts | Now | Debt | Outstanding debt visibility; minimum payment trap and snowball/avalanche lessons |
| **Credit card limit(s)** | AISP Accounts | Now | Debt, Credit Score | Credit utilisation ratio; impact on credit score education |
| **Credit utilisation ratio** | AISP Derived | Now | Debt, Credit Score | Key credit health metric; optimal utilisation range lessons |
| **Minimum payment amount** | AISP Account data | Now | Debt | True cost of minimum payments; interest accumulation lessons |
| **Full repayment vs minimum behaviour** | AISP Transactions (pattern) | Now | Debt | Detects repayment habits; full clearance benefit education |
| **Credit card balance trajectory** | AISP Derived (3–12mo) | Now | Debt | Paying down vs accumulating; debt direction awareness |
| **Number of credit accounts** | AISP Accounts | Now | Debt, Credit Score | Multiple debt awareness; consolidation and management lessons |
| **Overdraft usage frequency** | AISP Transactions (derived) | Now | Debt, Budgeting | Arranged vs unarranged overdraft education; cost awareness lessons |
| **Overdraft depth (max negative balance)** | AISP Derived | Now | Debt | Severity assessment; overdraft reduction strategy lessons |
| **Personal loan balance** | AISP Accounts (partial) | Partial | Debt | Outstanding loan visibility; early repayment and refinancing lessons |
| **Loan repayment amount** | AISP Transactions (derived) | Now | Debt, Budgeting | Monthly obligation mapping; debt-to-income ratio calculation |
| **Total debt-to-income ratio** | AISP Derived | Now | Debt, Housing | Aggregate debt health; mortgage eligibility and affordability lessons |
| **Student loan repayment detection** | AISP Transactions (derived) | Now | Debt, Tax | Plan type identification; threshold and repayment strategy education |
| **BNPL total obligations** | AISP Transactions (derived) | Now | Debt | Hidden debt mapping; total commitment awareness and credit impact lessons |
| **Debt repayment order optimisation** | AISP Derived | Now | Debt | Snowball vs avalanche comparison using actual balances and rates |

## **5\. Housing & Property**

Housing is typically the largest financial commitment. Detecting homeowner vs renter status, mortgage payments, and first-time buyer indicators routes users to the most relevant housing education pathway.

| Data Point | Source | Availability | Learning Areas | Educational Application |
| :---- | :---- | :---- | :---- | :---- |
| **Mortgage payment amount** | AISP Transactions (derived) | Partial | Housing, Budgeting | Monthly housing cost; affordability ratio and overpayment education |
| **Mortgage balance (where visible)** | AISP Accounts | Limited | Housing | Remaining mortgage education; equity building and LTV lessons |
| **Rent payment amount** | AISP Transactions (derived) | Now | Housing, Budgeting | Rent-to-income ratio; rent vs buy comparison lessons |
| **Homeowner vs renter status** | AISP Derived | Now | Housing | Routes user to relevant housing pathway: first-time buyer vs homeowner lessons |
| **Mortgage product type inference** | AISP Transactions (pattern) | Partial | Housing | Fixed vs variable detection; remortgage timing and rate education |
| **Stamp duty estimation** | User input \+ derived | Now | Housing, Tax | First-time buyer relief; stamp duty calculation lessons |
| **First-time buyer indicator** | AISP \+ User input | Now | Housing | Unlocks Help to Buy, LISA, shared ownership, and FTB scheme lessons |
| **Deposit savings progress** | AISP Derived \+ User goal | Now | Housing, Saving | Deposit target tracking; timeline and boost strategy lessons |
| **Home insurance payment** | AISP Transactions (derived) | Now | Housing, Protection | Buildings and contents cover awareness; comparison and review lessons |
| **Ground rent / service charge** | AISP Transactions (derived) | Partial | Housing | Leasehold cost awareness; freehold vs leasehold education |

## **6\. Investing & Wealth Building**

Investment data availability is growing but still limited. Where accessible, it enables portfolio education, fee awareness, and tax-efficient investing lessons. Transaction-based contribution detection is available now even where full portfolio data isn’t.

| Data Point | Source | Availability | Learning Areas | Educational Application |
| :---- | :---- | :---- | :---- | :---- |
| **Investment platform balance(s)** | Open Finance / AISP | Limited | Investing | Portfolio value visibility; asset allocation and diversification lessons |
| **Investment holdings (fund names)** | Open Finance | Limited | Investing | Fund type education; passive vs active, index fund lessons |
| **Investment contributions (regular)** | AISP Transactions (derived) | Now | Investing | Contribution habit detection; pound-cost averaging education |
| **Dividend/income receipts** | AISP Transactions (derived) | Now | Investing, Tax | Investment income awareness; dividend allowance and tax lessons |
| **Investment-to-savings ratio** | AISP Derived | Partial | Investing, Saving | Cash vs invested assets balance; inflation risk of cash lessons |
| **Capital gains realisations** | Open Finance | Limited | Investing, Tax | CGT allowance usage; tax-efficient selling lessons |
| **Platform/fund fee estimation** | Open Finance (derived) | Limited | Investing | Cost drag education; fee comparison and compound impact lessons |
| **Risk profile inference** | Derived from holdings | Limited | Investing | Equity/bond/cash split; risk tolerance alignment education |

## **7\. Pensions & Retirement**

Pension data is the biggest gap in Open Banking today. However, workplace contribution detection via bank transactions is possible now, and the Pensions Dashboards Programme will unlock comprehensive retirement education when live.

| Data Point | Source | Availability | Learning Areas | Educational Application |
| :---- | :---- | :---- | :---- | :---- |
| **Workplace pension contribution (employee)** | AISP Transactions (derived) | Now | Retirement | Contribution rate detection; auto-enrolment minimum vs optimal education |
| **Employer pension contribution** | AISP Transactions (derived) | Partial | Retirement | Employer match awareness; “free money” maximisation lessons |
| **Pension pot value(s)** | Pensions Dashboard (future) | Future | Retirement | Total retirement pot visibility; adequacy and projection lessons |
| **State Pension entitlement** | Gov.uk (manual/future link) | Future | Retirement | NI record gaps; state pension forecast and top-up lessons |
| **Pension type (DB vs DC)** | Pensions Dashboard (future) | Future | Retirement | Scheme type education; DB transfer warnings, DC contribution strategy |
| **Pension fund allocation** | Pensions Dashboard (future) | Future | Retirement, Investing | Default fund awareness; lifestyle strategies and de-risking lessons |
| **Number of pension pots** | Pensions Dashboard (future) | Future | Retirement | Pot consolidation education; lost pension tracing lessons |
| **Total pension contribution rate** | AISP \+ employer data | Partial | Retirement | Combined contribution adequacy; salary sacrifice and tax relief lessons |
| **Pension tax relief band** | AISP Income (derived) | Now | Retirement, Tax | Basic vs higher-rate relief; pension contribution optimisation lessons |

## **8\. Protection & Insurance**

Insurance premium detection from bank transactions reveals existing cover. Combined with income and family data, this enables protection gap analysis and ensures users understand what happens to their finances if they can’t work.

| Data Point | Source | Availability | Learning Areas | Educational Application |
| :---- | :---- | :---- | :---- | :---- |
| **Life insurance premium detection** | AISP Transactions (derived) | Now | Protection | Existing cover identification; adequacy and review lessons |
| **Income protection premium detection** | AISP Transactions (derived) | Now | Protection | IP cover awareness; protection gap and sick pay education |
| **Critical illness cover detection** | AISP Transactions (derived) | Now | Protection | CI cover identification; overlap with life insurance education |
| **Health insurance premium detection** | AISP Transactions (derived) | Now | Protection | PMI awareness; NHS vs private, employer benefits lessons |
| **Pet insurance detection** | AISP Transactions (derived) | Now | Protection | Pet cover awareness; excess and exclusion education |
| **Car insurance detection** | AISP Transactions (derived) | Now | Protection | Motor cover identification; comparison and renewal education |
| **Travel insurance detection** | AISP Transactions (derived) | Now | Protection | Cover awareness; single trip vs annual, bank account perks lessons |
| **Protection gap estimation** | AISP Derived | Partial | Protection | Income-at-risk if unable to work; family dependency and cover needs lessons |

## **9\. Tax & Allowances**

Tax education is one of the most requested but least understood areas of personal finance. Income-derived tax band estimation and transaction pattern analysis unlock personalised lessons on allowances, reliefs, and self-assessment obligations.

| Data Point | Source | Availability | Learning Areas | Educational Application |
| :---- | :---- | :---- | :---- | :---- |
| **Estimated income tax band** | AISP Income (derived) | Now | Tax | Tax band awareness; personal allowance, higher-rate threshold education |
| **Tax code detection (from payslip ref)** | AISP Transactions (partial) | Partial | Tax | Tax code explanation; common errors and HMRC contact lessons |
| **Self-assessment indicator** | AISP Transactions (pattern) | Now | Tax | Triggers self-employed tax lessons; payment on account, record keeping |
| **Gift Aid eligible donations** | AISP Transactions (derived) | Now | Tax | Charitable giving tax relief; higher-rate reclaim education |
| **Marriage Allowance eligibility** | AISP Income (derived) | Partial | Tax | Transfer eligibility; backdated claim education |
| **Child Benefit repayment risk** | AISP Income (derived) | Now | Tax | High Income Child Benefit Charge; salary sacrifice mitigation lessons |
| **Capital gains tax allowance usage** | Open Finance (derived) | Limited | Tax, Investing | Annual exempt amount; bed and ISA, timing of disposals education |
| **Dividend allowance usage** | Open Finance (derived) | Limited | Tax, Investing | Dividend tax awareness; ISA sheltering lessons |

## **10\. Behavioural & Engagement Signals**

Behavioural signals don’t represent financial products but reveal how a user interacts with their money. These patterns are critical for calibrating lesson timing, complexity, and motivational framing — ensuring education lands at the right moment in the right way.

| Data Point | Source | Availability | Learning Areas | Educational Application |
| :---- | :---- | :---- | :---- | :---- |
| **Financial engagement score** | AISP Derived (composite) | Now | All | How actively the user manages money; tailors lesson depth and frequency |
| **Impulse spending patterns** | AISP Transactions (time/amount) | Now | Budgeting, Wellbeing | Late-night or weekend spending spikes; behavioural awareness lessons |
| **Pay-yourself-first behaviour** | AISP Transactions (timing) | Now | Saving | Whether savings happen before or after spending; automation lessons |
| **Direct debit / standing order count** | AISP Transactions | Now | Budgeting | Financial organisation indicator; bill management and automation lessons |
| **Account switching frequency** | AISP Derived | Partial | Saving, Budgeting | Switching inertia awareness; best-deal and loyalty cost lessons |
| **Balance before payday (lowest point)** | AISP Derived | Now | Budgeting | Cash flow stress indicator; buffer building and smoothing lessons |
| **Savings withdrawal frequency** | AISP Transactions (pattern) | Now | Saving | Savings leakage detection; friction and separate account lessons |
| **New account opening patterns** | AISP Accounts (timing) | Now | All | Financial product engagement; comparison and suitability lessons |
| **Consistent bill payment record** | AISP Transactions (pattern) | Now | Credit Score | Payment reliability; credit score building and missed payment impact lessons |
| **Round-up / micro-saving potential** | AISP Transactions (derived) | Now | Saving | Transaction rounding calculation; micro-saving app and automation lessons |

## **11\. User Profile & Life Stage Signals**

A combination of derived signals and user-provided inputs that enable Mulo to understand who the user is and what financial life stage they’re in. These signals determine curriculum emphasis and ensure every lesson feels relevant to the user’s actual situation.

| Data Point | Source | Availability | Learning Areas | Educational Application |
| :---- | :---- | :---- | :---- | :---- |
| **Approximate age range** | AISP Account tenure \+ patterns | Now | All | Age-appropriate content routing; pension urgency, student content, family stage |
| **Employment status** | AISP Income pattern | Now | Tax, Budgeting | Employed vs self-employed vs unemployed; tailors budgeting and tax content |
| **Estimated household size** | AISP Transactions (derived) | Partial | Family Finance | Child benefit, council tax, grocery patterns; household-appropriate education |
| **Dependants indicator** | AISP Transactions (child benefit) | Now | Protection, Family | Life insurance need, wills, child savings lessons triggered |
| **Region / location inference** | AISP Transactions (patterns) | Partial | Housing, Tax | Regional cost-of-living context; local property market and council tax education |
| **Financial confidence level** | User input \+ engagement | Now | All | Self-assessed or inferred; calibrates lesson complexity and terminology |
| **Financial goals (user-stated)** | User input | Now | All | Primary goal drives lesson priority: house deposit, debt-free, retirement, emergency fund |
| **Risk tolerance (user-stated)** | User input | Now | Investing | Investment lesson calibration; product suitability awareness |
| **Life stage indicators** | AISP \+ User input | Now | All | Student, early career, family, pre-retirement; determines curriculum emphasis |

# **Summary**

**Total data points catalogued: 111**

Availability breakdown: **68 available now** via current UK Open Banking APIs, **22 partially available** (provider-dependent or requiring inference), **10 limited** (select platforms only), and **11 future** (dependent on Open Finance / Pensions Dashboards).

These 111 data points span Mulo’s entire curriculum and enable personalisation at every layer — from which lessons to surface, to how “Apply to My Money” calculations are populated, to the behavioural nudges and motivational framing that make education stick.