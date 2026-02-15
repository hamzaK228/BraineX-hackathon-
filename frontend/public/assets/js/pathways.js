/**
 * Pathways Page JS
 */
document.addEventListener('DOMContentLoaded', () => {
  loadPathwayDetails();
});

async function loadPathwayDetails() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id') || params.get('pathway');
  const container = document.getElementById('pathwayDetails');

  if (!id) {
    document.getElementById('pathwayTitle').textContent = 'Explore Pathways';
    document.getElementById('pathwayDesc').textContent =
      'Select a pathway from the Fields page to view details.';
    container.innerHTML =
      '<div class="empty-state">No pathway selected. <a href="/fields">Go back to Fields</a></div>';
    return;
  }

  // Mock Data - in real app, fetch from API
  const mockPathways = {
    ai: {
      title: 'Artificial Intelligence & Data Science',
      desc: 'Build intelligent systems and algorithms.',
      stages: [
        { title: 'Foundations', content: 'Learn Python, Statistics, Linear Algebra.' },
        { title: 'Machine Learning', content: 'Supervised/Unsupervised Learning, Scikit-learn.' },
        { title: 'Deep Learning', content: 'Neural Networks, TensorFlow/PyTorch.' },
        { title: 'Specialization', content: 'NLP, Computer Vision, or Reinforcement Learning.' },
      ],
      salary: '$120k+',
      growth: '85%',
    },
    healthcare: {
      title: 'Healthcare Innovation',
      desc: 'Combine technology with healthcare.',
      stages: [
        { title: 'Biology Basics', content: 'Understanding human anatomy and cell biology.' },
        { title: 'Health Tech', content: 'Medical devices, Telemedicine platforms.' },
        { title: 'Data Analysis', content: 'Bioinformatics, Patient data privacy.' },
      ],
      salary: '$95k+',
      growth: '72%',
    },
    sustainable: {
      title: 'Sustainable Technology',
      desc: 'Solutions for environmental challenges.',
      stages: [
        { title: 'Environmental Science', content: 'Climate systems, Ecology.' },
        { title: 'Green Energy', content: 'Solar, Wind, Battery tech.' },
        { title: 'Policy & Ethics', content: 'Regulations, Sustainability standards.' },
      ],
      salary: '$85k+',
      growth: '90%',
    },
    digital: {
      title: 'Digital Business',
      desc: 'Digital transformation and e-commerce.',
      stages: [
        { title: 'Marketing', content: 'SEO, Content Strategy, Analytics.' },
        { title: 'E-commerce', content: 'Shopify, User Experience (UX).' },
        { title: 'Strategy', content: 'Business models, Scaling.' },
      ],
      salary: '$75k+',
      growth: '68%',
    },
  };

  const data = mockPathways[id];

  if (data) {
    document.getElementById('pathwayTitle').textContent = data.title;
    document.getElementById('pathwayDesc').textContent = data.desc;

    container.innerHTML = `
            <div class="pathway-detail">
                <div class="field-stats" style="margin-bottom: 2rem;">
                    <div class="stat"><strong>Avg Salary:</strong> ${data.salary}</div>
                    <div class="stat"><strong>Growth:</strong> ${data.growth}</div>
                </div>
                
                <h2>Career Roadmap</h2>
                <div class="stages-list">
                    ${data.stages
                      .map(
                        (stage, idx) => `
                        <div class="stage-card">
                            <h3>Step ${idx + 1}: ${stage.title}</h3>
                            <p>${stage.content}</p>
                        </div>
                    `
                      )
                      .join('')}
                </div>
                
                <div style="margin-top: 2rem; text-align: center;">
                    <a href="/roadmaps?pathway=${id}" class="btn btn-primary">Start Interactive Roadmap</a>
                </div>
            </div>
        `;
  } else {
    container.innerHTML = '<div class="error-state">Pathway not found.</div>';
  }
}
