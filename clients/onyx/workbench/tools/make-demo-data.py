import openpyxl,re,json,random,datetime,os
from collections import Counter,defaultdict
U=os.environ.get("ONYX_SAMPLES","")  # directory holding the real exports; deliberately not in the repo
SRC=os.environ.get('ONYX_SAMPLE_FILE','ONYX-SAMPLE-002.xlsx')
ws=openpyxl.load_workbook(os.path.join(U,SRC)).active
H=[c.value for c in ws[1]][:13]; R=[]
for r in range(2,ws.max_row+1):
    v=[ws.cell(r,c).value for c in range(1,14)]
    if all(x is None for x in v): continue
    R.append(dict(zip(H,v))|{'_row':r})

TEMPLATE=r'1\.\s*what was their purpose in coming in today\?'
RULES={
 'Competitor named':[r'fitness first',r'\bff\b',r'world gym',r'\bwg\b',r'snap fitness',r'city gym',r'anytime',r'\baf\b',r'crunch',r'titans',r'crossfit',r'pump gym',r'prime strength',r'boxing.{0,10}gym'],
 'Too far':[r'too far',r'a bit far',r'not local',r'lives out west',r'far from',r'inconvenient'],
 'Just visiting':[r'tourist',r'layover',r'interstate',r'only here for',r'visiting',r'here for a? ?(concert|wedding|course)',r'from (perth|melbourne|canberra|vic|qld|queensland|tas|gold coast|brisbane)'],
 'Price objection':[r'price sensitive',r'joining fee',r'not worth the money',r'cheap',r'\$\d',r'discount'],
 'Happy elsewhere':[r'happy at',r'not interested in making a switch',r'not looking for a new gym',r"isn't looking for a new gym",r'no issues'],
 'Unresponsive':[r'unresponsive',r'unable to contact',r'left vm',r'not to be contacted',r'requested no call',r'close out'],
 'No show':[r'\bno[ -]?show\b'],
 'High intent':[r'high prospect',r'keen (to|on) (sign|join)',r'wants to sign up',r'please follow up',r'looking to join',r'interest in joining',r'decision in next',r'came in to sign up'],
 'New to area':[r'just moved',r'new to the area',r'moved (here|to)',r'moving to'],
 'Brought by member':[r'friend of existing member',r'with (his|her) (friend|mate|mates|house ?mate|partner)',r'friends train here',r'train with (his|her) (friend|mate)'],
 'Fitness Passport':[r'fitness ?passport',r'\bfp\b'],
 'PT interest':[r'\bpt\b consult',r'speak with a pt',r'consultation with a pt'],
 'Other site lead':[r'artarmon'],
}
def txt(x): return ' '.join(str(v) for v in [x['Task Description'],x['Task Cleared Note'],x['Member Note']] if v).lower()
# RECOVER: only outside the pasted script boilerplate
RECOVER_BOILER=r'are they currently doing much for recovery, or are they interested in it\?\s*4\.'
for x in R:
    t=txt(x)
    stripped=re.sub(r'are they currently doing much for recovery[^?]*\?','',t)
    x['_tags']=[n for n,ps in RULES.items() if any(re.search(p,t) for p in ps)]
    if re.search(r'recover|sauna|soak',stripped): x['_tags'].append('RECOVER interest')
    x['_script']=bool(re.search(TEMPLATE,str(x['Task Description'] or '').lower()))
rec=[x for x in R if 'RECOVER interest' in x['_tags']]
print('RECOVER interest, boilerplate excluded: n=%d converted=%d'%(len(rec),sum(1 for x in rec if x['Active Memberships']==1)))
print('untagged:',sum(1 for x in R if not x['_tags']))

# --- synthetic free text carrying the same tags ---
random.seed(11)
NAMES='Tahlia Declan Priya Marcus Noor Eli Sienna Hamish Rina Travis Yasmin Cormac Bianca Omar Freya Lachie Nadia Beau Imogen Tobias Anika Rory Delphine Kwame Saskia Callum Mireille Dev Greta Fintan Joss Perla Ronan Mika Teodora Abe Wren Kaito Sunny Marlo'.split()
GYMS=['Fitness First','World Gym','Anytime Fitness','Snap Fitness','City Gym','Crunch','a CrossFit box in Marrickville','a boxing-only gym nearby','PUMP Chatswood']
FAR=['Lane Cove','Bondi','out past Liverpool','North Ryde','Croydon','Artarmon']
AWAY=['Perth','Melbourne','Canberra','the Gold Coast','Brisbane','regional Vic']
SUB=['Newtown','Redfern','Zetland','Erskineville','Waterloo','Rosebery','Mascot']

def visit(x,nm):
    """The write-up of the visit itself (Task Description)."""
    t=x['_tags']; s=[]
    s.append(f"Paid casual. {nm} came in for a first session." if x['Task Type'].startswith('Casual') else f"{nm} came in for a look around.")
    if 'New to area' in t: s.append(f"Just moved to {random.choice(SUB)} and is shopping around for a gym.")
    if 'Competitor named' in t: s.append(f"Currently training at {random.choice(GYMS)}.")
    if 'Brought by member' in t: s.append("Came in with a mate who already trains here.")
    if 'Just visiting' in t: s.append(f"Only in Sydney for a couple of days, down from {random.choice(AWAY)}.")
    if 'Fitness Passport' in t: s.append("Wants to come on under Fitness Passport once it activates.")
    if 'RECOVER interest' in t: s.append("Asked about the sauna and the RECOVER add-on.")
    if 'PT interest' in t: s.append("Wants to book a consult with a PT.")
    if 'Price objection' in t: s.append(random.choice(["Pushed back on the joining fee.","Very price sensitive, asked what deals were running.","Said the monthly rate was more than they wanted to spend."]))
    if 'High intent' in t: s.append(random.choice(["Keen to sign up, following up tomorrow.","Said they would decide this week.","Ready to join, just wanted to read the contract first."]))
    if not t: s.append(random.choice(["Ran through the floor and the class timetable.",
        "Showed them the free weights and the turf.","Quiet session, did their own thing.",
        "Trained legs, in and out in an hour.","Asked where the change rooms were and got on with it."]))
    return ' '.join(s)

def decision(x,nm):
    """The follow-up call (Member Note) - deliberately different words from the write-up."""
    t=x['_tags']; s=[]
    if 'Unresponsive' in t: s.append("No follow up required: prospect unresponsive, closing out.")
    if 'No show' in t: s.append("No show.")
    if 'Too far' in t: s.append(f"Lives over in {random.choice(FAR)}, so getting here regularly would be a stretch.")
    if 'Happy elsewhere' in t: s.append("Happy where they are and not looking to switch.")
    if 'Other site lead' in t: s.append("Better fit for Artarmon, passed the lead across.")
    if 'High intent' in t and 'Unresponsive' not in t: s.append("Please follow up this week.")
    if not s: s.append(random.choice(["Left a voicemail, will try again.","Said they would think it over.",
        "Gave them a timetable and the casual pack pricing.","Wants to bring their partner in before deciding.",
        "Will come back on the weekend to see how busy it gets.","Took a card, said they would call.",
        "Comparing us against two others before committing.","Asked to be called back after payday."]))
    s.append(random.choice(["Took their number.","Sent the membership link.","Offered a 7-day pass.",
        "Added them to the callback list.","Booked them in for a proper tour.","Walked them through the app.",
        "Noted their training days.","Flagged for the weekend shift.",""]))
    return ' '.join(x for x in s if x)

SCRIPT=("Prospect {nm} last visited the facility on the {d}. Prospect has been taken through our sales & tour process. "
        "Copy and paste below required notes below, and edit accordingly for each tour. "
        "1. What was their purpose in coming in today? 2. What was their problem? "
        "3. Are they currently doing much for recovery, or are they interested in it? "
        "4. Timeframe: when are they expecting to make a change?")
ANSWERED=("1. What was their purpose in coming in today? {a1} "
          "2. What was their problem? {a2} "
          "3. Are they currently doing much for recovery, or are they interested in it? {a3} "
          "4. Timeframe: when are they expecting to make a change? {a4}")
A1=["Lives in the area and is shopping around for gyms.","Just moved to Newtown and needs somewhere close.","Works around the corner and wanted to see the floor."]
A2=["Very price sensitive.","Their current gym gets too busy at peak.","No squat racks free when they train."]
A3=["No, but interested once it was explained.","Uses a sauna elsewhere already.","Not doing anything for it right now."]
A4=["In a week or two.","End of the month when their contract runs out.","Straight away if the numbers work."]
JUNK=['see toured notes','test','paid','Paid','see tour notes']
WEBFORM=('Subject: {sub}  Tour / Visit Date: {d}  Tour / Visit Time: {tm}  PT Preference:  '
         'Business Name (Partnership):  Source Promotion (Add Manually): {src}  Message: ')
SYSEV=['Member has edited their profile: language: "" -> "en_GB".',
       'Member #{n} has set a new password via the Member Portal']

dupkey=Counter(str(x['Task Description'])[:120] for x in R if x['Task Description'])
dupmap={}
answer_re=re.compile(r'coming in today\?\s*[-:]?\s*\S{3,}',re.I)
for i,x in enumerate(R):
    nm=NAMES[i%len(NAMES)]; x['_nm']=nm
    d=x['Task Cleared On']
    ds=(d if isinstance(d,str) else d.strftime('%Y-%m-%d'))[:10]
    pretty=datetime.datetime.strptime(ds,'%Y-%m-%d').strftime('%-d %b %Y')
    key=str(x['Task Description'])[:120] if x['Task Description'] else None
    # -- Task Description --
    if x['Task Description'] is None: nd=None
    elif x['_script']: nd=SCRIPT.format(nm=nm,d=pretty)
    elif len(str(x['Task Description']))<20: nd=random.choice(JUNK)
    elif key and dupkey[key]>1:
        dupmap.setdefault(key,visit(x,nm)); nd=dupmap[key]
    else: nd=visit(x,nm)
    # -- Task Cleared Note: where the tour answers belong --
    f=x['Task Cleared Note']
    if f is None: nf=None
    elif f=='Autocompleted from prospect becoming a member': nf=f
    elif answer_re.search(str(f)):
        nf=ANSWERED.format(a1=random.choice(A1),a2=random.choice(A2),a3=random.choice(A3),a4=random.choice(A4))
    elif len(str(f))<20: nf=random.choice(JUNK+['No show','Called, left voicemail'])
    else: nf=decision(x,nm)
    # -- Member Note: follow-up decision, or the web-form dump bleeding in --
    k=x['Member Note']
    if k is None: nk=None
    elif re.search(r'subject:|password|edited their profile|referred-by|best-time',str(k),re.I):
        if re.search(r'subject:|referred-by|best-time',str(k),re.I):
            nk=WEBFORM.format(sub=('Book a Gym Tour' if x['Task Type']=='Prospect Toured' else 'General Enquiry'),
                              d=ds,tm=random.choice(['Morning','Afternoon','Evening']),src=x['Member Source Promotion'] or 'Google')
        else:
            nk=random.choice(SYSEV).format(n=random.randint(6000,9000))
        # on a tour row the note is the raw form dump only - that is the point
        if not x['_script'] and len(str(k))>260: nk=decision(x,nm)+'  '+nk
    else: nk=decision(x,nm)
    x['_D'],x['_F'],x['_K']=nd,nf,nk

cols=H; out=[]
for x in R:
    row=[]
    for c in cols:
        v={'Task Description':x['_D'],'Task Cleared Note':x['_F'],'Member Note':x['_K']}.get(c,x[c])
        if isinstance(v,datetime.datetime): v=v.strftime('%Y-%m-%dT%H:%M:%S')
        row.append(v)
    out.append(row)
payload={'name':'ONYX-AUG-2026-SAMPLE.xlsx','sheet':'Sheet1','headers':cols,'rows':out}
open('demo.json','w').write(json.dumps(payload,separators=(',',':')))
print('wrote demo.json',len(json.dumps(payload)),'bytes,',len(out),'rows')
# Leak check: no word appearing in the real notes may survive into the output.
# The vocabulary is read from the source file at run time so no real name is written down here.
words=set()
for x in R:
    for c in ('Task Description','Task Cleared Note','Member Note'):
        for w in re.findall(r"[A-Z][a-z]{3,}", str(x[c] or '')): words.add(w)
bad=sorted(words - set(NAMES) - {'Paid','Prospect','Copy','Currently','Came','Lives','Member','Subject','Tour','Visit','Time','Date','Message','Source','Promotion','Business','Name','Fitness','Passport','Gold','Coast','Sydney','Autocompleted','Only','They','This','That','What','Were','When','Note','Here','Just','Have','Need','Said','Will','Been','From','With','Their','Went','Also','Wants','Asked','Onyx','ONYX'})
blob=json.dumps(payload)
leaks=[b for b in bad if re.search(r'\b'+re.escape(b)+r'\b',blob)]
print('tokens from the real notes surviving into the output:',leaks or 'NONE')
# fidelity check against the real file
real_script=[x for x in R if x['_script']]
real_ans=[x for x in R if x['Task Cleared Note'] and answer_re.search(str(x['Task Cleared Note']))]
print('script rows:',len(real_script),' with answers in the real file:',len(real_ans))
