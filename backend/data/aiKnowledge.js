// backend/data/aiKnowledge.js
// Static knowledge injected into every AI prompt.
// Edit this file to update what the AI knows about BraineX and general advice.

export const knowledge = {

  platform: `
BraineX is an educational platform for students with these features:
- Scholarships: browse active scholarships, filter by field/category, apply directly
- Mentors: book 1-on-1 sessions with verified professionals in your field
- Projects: join or create academic/research projects with other students
- Events: register for workshops, seminars, conferences, and networking events
- Fields: explore career paths, salary ranges, and demand levels per discipline
  `,

  scholarshipAdvice: `
HOW TO WIN SCHOLARSHIPS (general advice):

Basic tips:
- Apply to at least 8-10 scholarships — volume increases your odds
- Read the eligibility requirements carefully before applying
- Apply as early as possible — many close months before the deadline
- Tailor your application to each scholarship's specific mission

Writing a strong essay:
- Open with a specific story or moment, not a generic statement like "I've always loved science"
- Connect YOUR background → YOUR goals → THIS scholarship's mission
- Use concrete achievements: "Led a team of 5", "Raised $2000", "Published in X journal"
- Keep it under the word limit and have 2-3 people review it
- End with what you'll do AFTER receiving the scholarship, not just why you want it

Recommendation letters:
- Ask recommenders who know your work closely, not just famous names
- Give them: your CV, the scholarship description, and 3 bullet points about you to highlight
- Ask at least 6 weeks before the deadline
- Send a thank-you note after

Common mistakes:
- Submitting generic essays to every scholarship
- Missing small local scholarships (less competition, same money)
- Not following formatting instructions exactly
- Forgetting to request transcripts or official documents in time
  `,

  mentorAdvice: `
HOW TO GET THE MOST FROM MENTORSHIP:

Finding the right mentor:
- Look for someone 5-10 years ahead of where you want to be
- Field match matters more than company prestige
- Check their rating and number of mentees on BraineX

First message template:
"Hi [Name], I'm [your name], a [year] student in [field].
I'm working on [specific goal] and would love 30 minutes to ask about [specific topic].
Are you available for a short call this month?"

During the session:
- Prepare 3-5 specific questions in advance
- Take notes in real time
- Ask: "What do you wish you knew at my stage?"
- Ask for one concrete next step you can take this week

After the session:
- Send a thank-you message within 24 hours
- Share an update 2-4 weeks later on progress you made
- Don't ask for favors in the first 2-3 sessions — build the relationship first
  `,

  projectAdvice: `
HOW TO SUCCEED IN PROJECTS ON BRAINEX:

Joining a project:
- Pick projects matching your current skill level (beginner/intermediate/advanced)
- Read the objectives and deliverables before joining
- Smaller teams (2-4 people) move faster than large ones

Running your own project:
- Write a clear 1-paragraph description of the problem you're solving
- List required skills honestly — wrong skill matches kill projects early
- Set a realistic duration: most student projects take 2x longer than planned
- Define deliverables upfront so the team knows what "done" looks like

Adding projects to your resume:
- List the tech stack, team size, and measurable outcome
- Example: "Built AI chatbot with team of 4, achieved 87% intent accuracy"
- Link to a GitHub repo or demo if possible
  `,

  eventAdvice: `
HOW TO GET VALUE FROM EVENTS:

Before the event:
- Research the organizer and speakers in advance
- Prepare 2-3 questions to ask during Q&A
- Set a goal: "I want to meet 3 people in [field]"

Networking at events:
- Introduce yourself with: name + field + what you're working on (30 seconds)
- Ask "What are you working on?" — people love talking about their work
- Exchange LinkedIn or email before moving on
- Follow up within 48 hours with a personalized message

Online events:
- Use the chat actively — ask questions, comment on others' points
- Turn your camera on when possible
- Save the recording link if provided
  `,

  careerAdvice: `
GENERAL CAREER ADVICE FOR STUDENTS:

Building your profile:
- One strong project beats ten mediocre ones on a resume
- GitHub activity, publications, or a portfolio matter more than GPA alone
- Get one relevant internship before graduation, even unpaid

High-demand fields right now (2025-2026):
- AI & Data Science: very high demand, 25% YoY growth
- Climate Tech: high demand, growing fast with new funding
- Biotech: high demand, especially post-pandemic research expansion
- Finance/FinTech: high demand, especially quantitative roles

Networking:
- 70% of jobs are filled through referrals — relationships matter
- LinkedIn: connect with alumni from your university in your target field
- Attend industry events 6-12 months before you need a job
  `
};
