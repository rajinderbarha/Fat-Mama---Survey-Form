const steps = document.querySelectorAll('.step');
const introSection = document.querySelector('.intro-section');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const emailInput = document.getElementById('emailInput');
const emailError = document.getElementById('emailError');
let currentStep = 0;

//most important and keep it secure :)
const AIRTABLE_BASE_ID = 'appKe4AlJoAv8tyVI';
const AIRTABLE_TABLE_NAME = 'Responses';
const AIRTABLE_API_KEY = 'pat1AETmFwZFeup0R.aaa6707e2500cbab1e76bd0aa3461abad03eeb398774047f5e84c4f1b86edef5';
const IMGBB_API_KEY = '072e97519723ff8ab21e2599ca9a64a8';


function showStep(index) {
    steps.forEach((step, i) => {
        step.style.display = i === index ? 'block' : 'none';
    });
    introSection.style.display = index === 0 ? 'block' : 'none';
    prevBtn.style.display = index === 0 ? 'none' : 'inline-block';

    if (index === steps.length - 1) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'inline-block';
    } else {
        nextBtn.style.display = 'inline-block';
        submitBtn.style.display = 'none';
    }
}

function updateScore(field, value) {
    const fieldData = data[field];
    if (fieldData) {
        fieldData.answer = value;
        fieldData.score = value ? 10 : 0; 
        fieldData.total = fieldData.total; 
    }
    calculateTotalScore();
}

// Calculate total score
function calculateTotalScore() {
    let countedScore = 0;
    let totalScore = 0;

    Object.values(data).forEach(field => {
        if (field.score !== undefined && field.total !== undefined) {
            countedScore += field.score;
            totalScore += field.total;
        }
    });

    data.counted_score = countedScore;
    data.total_score = totalScore;
}


//show step on loaded
document.addEventListener('DOMContentLoaded', () => {
    showStep(currentStep);

    document.getElementById('nextBtn').addEventListener('click', () => {
        if (currentStep === 0) {  // Email Step
            if (!data.email) {
                emailError.style.display = 'block';
                return; // Stop here
            }
        }
        if (currentStep < steps.length - 1) {
            currentStep++;
            showStep(currentStep);
            console.log(data)
        }
    });

    document.getElementById('prevBtn').addEventListener('click', () => {
        if (currentStep > 0) {
            currentStep--;
            showStep(currentStep);
        }
    });
    const formData = JSON.parse(localStorage.getItem('formData')) || {};
    if (formData.email) {
        emailInput.value = formData.email;
    }
});

// Auto-save email on input
emailInput.addEventListener('input', () => {
    const email = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email.length < 5) {
        emailError.style.display = 'none';
        data.email = "";
        return;
    }
    if (emailRegex.test(email)) {
        emailError.style.display = 'none';
        data.email = email;
    } else {
        emailError.style.display = 'block';
        data.email = ""; // Optional: clear if invalid
    }
});

document.querySelectorAll('input[type="radio"]').forEach(input => {
    input.addEventListener('change', (e) => {
        const name = e.target.name;  // Like 'cleanliness', 'greeted'...
        const value = e.target.value;
        updateScore(name, value);
    });
});


document.querySelectorAll('textarea').forEach(textarea => {
    textarea.addEventListener('input', (e) => {
        const name = e.target.name;
        data[name] = e.target.value;
    });
});

// for uploads
document.querySelector('input[name="uploads"]').addEventListener('change', async (e) => {
    const files = Array.from(e.target.files);

    if (files.length > 10) {
        alert("You can upload up to 10 files only.");
        e.target.value = '';
        return;
    }

    const uploadedUrls = [];

    for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);

        const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: 'POST',
            body: formData
        });

        const result = await res.json();
        uploadedUrls.push(result.data.url);
    }

    data.uploads = uploadedUrls;
    console.log("Uploaded URLs:", data.uploads);
});

// for reciept upload
document.querySelector('input[name="receipt_upload"]').addEventListener('change', async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData
    });

    const result = await res.json();
    data.receipt_upload = result.data.url;

    console.log("Receipt Uploaded URL:", data.receipt_upload);
});


// submit functionallity 
submitBtn.addEventListener('click', async (e) => {
    e.preventDefault();  // Prevent default form submit

    console.log("Final Data Submitted:", data);

    const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;
    const airtableHeaders = {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
    };

    const payload = {
        fields: {
            email: data.email,
            cleanliness: data.cleanliness.answer,
            cleanliness_score: data.cleanliness.score,
            cleanliness_total: data.cleanliness.total,

            greeted: data.greeted.answer,
            greeted_score: data.greeted.score,
            greeted_total: data.greeted.total,

            welcome: data.welcome.answer.join(', '),
            welcome_score: data.welcome.score,
            welcome_total: data.welcome.total,

            seated: data.seated.answer,
            seated_score: data.seated.score,
            seated_total: data.seated.total,

            qr_informed: data.qr_informed.answer,
            qr_informed_score: data.qr_informed.score,
            qr_informed_total: data.qr_informed.total,

            server_friendly: data.server_friendly.answer,
            server_friendly_score: data.server_friendly.score,
            server_friendly_total: data.server_friendly.total,

            recommendations: data.recommendations.answer,
            recommendations_score: data.recommendations.score,
            recommendations_total: data.recommendations.total,

            order_repeated: data.order_repeated.answer,
            order_repeated_score: data.order_repeated.score,
            order_repeated_total: data.order_repeated.total,

            food_allergies: data.food_allergies.answer,
            food_allergies_score: data.food_allergies.score,
            food_allergies_total: data.food_allergies.total,

            drinks_time: data.drinks_time.answer,
            drinks_time_score: data.drinks_time.score,
            drinks_time_total: data.drinks_time.total,

            food_time: data.food_time.answer,
            food_time_score: data.food_time.score,
            food_time_total: data.food_time.total,

            server_check: data.server_check.answer,
            server_check_score: data.server_check.score,
            server_check_total: data.server_check.total,

            second_offer: data.second_offer.answer,
            second_offer_score: data.second_offer.score,
            second_offer_total: data.second_offer.total,

            table_cleaned: data.table_cleaned.answer,
            table_cleaned_score: data.table_cleaned.score,
            table_cleaned_total: data.table_cleaned.total,

            starter_rating: data.starter_rating.answer,
            starter_rating_score: data.starter_rating.score,
            starter_rating_total: data.starter_rating.total,

            main_course_rating: data.main_course_rating.answer,
            main_course_rating_score: data.main_course_rating.score,
            main_course_rating_total: data.main_course_rating.total,

            dessert_rating: data.dessert_rating.answer,
            dessert_rating_score: data.dessert_rating.score,
            dessert_rating_total: data.dessert_rating.total,

            drink_rating: data.drink_rating.answer,
            drink_rating_score: data.drink_rating.score,
            drink_rating_total: data.drink_rating.total,

            dissatisfied: data.dissatisfied.answer,
            dissatisfied: data.dissatisfied.answer,
            dissatisfied: data.dissatisfied.answer,

            dissatisfaction_reason: data.dissatisfaction_reason.answer,

            raise_problem: data.raise_problem.answer,
            raise_problem_score: data.raise_problem.score,
            raise_problem_total: data.raise_problem.total,

            uploads: data.uploads.map(url => ({ url })),  // now working  

            payment_process: data.payment_process.answer,
            payment_process_score: data.payment_process.score,
            payment_process_total: data.payment_process.total,

            receipt_upload: [{ url: data.receipt_upload }], // working on it

            service_charge_info: data.service_charge_info.answer,
            service_charge_info_score: data.service_charge_info.score,
            service_charge_info_total: data.service_charge_info.total,

            tip_pressure: data.tip_pressure.answer,
            tip_pressure_score: data.tip_pressure.score,
            tip_pressure_total: data.tip_pressure.total,

            asked_for_review: data.asked_for_review.answer,
            asked_for_review_score: data.asked_for_review.score,
            asked_for_review_total: data.asked_for_review.total,

            honest_review_expected: data.honest_review_expected.answer,
            honest_review_expected_score: data.honest_review_expected.score,
            honest_review_expected_total: data.honest_review_expected.total,

            got_complimentary: data.got_complimentary.answer,
            got_complimentary_score: data.got_complimentary.score,
            got_complimentary_total: data.got_complimentary.total,

            goodbye_experience: data.goodbye_experience.answer,
            goodbye_experience_score: data.goodbye_experience.score,
            goodbye_experience_total: data.goodbye_experience.total,

            restaurant_cleanliness: data.restaurant_cleanliness.answer,
            restaurant_cleanliness_score: data.restaurant_cleanliness.score,
            restaurant_cleanliness_total: data.restaurant_cleanliness.total,

            restaurant_ambiance: data.restaurant_ambiance.answer,
            restaurant_ambiance_score: data.restaurant_ambiance.score,
            restaurant_ambiance_total: data.restaurant_ambiance.total,
            
            best_part_of_visit: data.best_part_of_visit,

            improve_experience: data.improve_experience,

            recommend_likelihood: data.recommend_likelihood.answer,
            recommend_likelihood_score: data.recommend_likelihood.score,
            recommend_likelihood_total: data.recommend_likelihood.total,

            counted_score: data.counted_score,
            total_score: data.total_score,
        }
    };

    try {
        const response = await fetch(airtableUrl, {
            method: 'POST',
            headers: airtableHeaders,
            body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok) throw new Error('Failed to submit to Airtable');
        console.log("Response Status:", response.status);
        console.log("Airtable Response:", result);

        document.querySelector('.form-container').innerHTML = `
        <div class="thank-you">
            <h2>Thank you for your response!</h2>
            <p>We appreciate your feedback.</p>
        </div>
    `;

    } catch (error) {
        console.error("Error submitting to Airtable:", error);
        alert("Something went wrong while saving your response.");
    }
});



const data = {
    email: "",

    cleanliness: { answer: "", score: 0, total: 10 },
    greeted: { answer: "", score: 0, total: 10 },
    welcome: { answer: [], score: 0, total: 15 },
    seated: { answer: "", score: 0, total: 10 },
    qr_informed: { answer: "", score: 0, total: 10 },

    server_friendly: { answer: "", score: 0, total: 10 },
    recommendations: { answer: "", score: 0, total: 5 },
    order_repeated: { answer: "", score: 0, total: 10 },

    food_allergies: { answer: "", score: 0, total: 10 },
    drinks_time: { answer: "", score: 0, total: 10 },
    food_time: { answer: "", score: 0, total: 10 },
    server_check: { answer: "", score: 0, total: 10 },
    second_offer: { answer: "", score: 0, total: 10 },
    table_cleaned: { answer: "", score: 0, total: 5 },

    starter_rating: { answer: "", score: 0, total: 5 },
    main_course_rating: { answer: "", score: 0, total: 5 },
    dessert_rating: { answer: "", score: 0, total: 5 },
    drink_rating: { answer: "", score: 0, total: 5 },
    dissatisfied: { answer: "", score: 0, total: 5 },
    dissatisfaction_reason: { answer: "", },
    raise_problem: { answer: "", score: 0, total: 10 },
    uploads: [],

    payment_process: { answer: "", score: 0, total: 10 },
    receipt_upload: "",
    service_charge_info: { answer: "", score: 0, total: 5 },
    tip_pressure: { answer: "", score: 0, total: 5 },
    asked_for_review: { answer: "", score: 0, total: 5 },
    honest_review_expected: { answer: "", score: 0, total: 5 },
    got_complimentary: { answer: "", score: 0, total: 10 },

    goodbye_experience: { answer: "", score: 0, total: 10 },
    restaurant_cleanliness: { answer: "", score: 0, total: 10 },
    restaurant_ambiance: { answer: "", score: 0, total: 10 },
    best_part_of_visit: { answer: "", },
    improve_experience: { answer: "", },
    recommend_likelihood: { answer: "", score: 0, total: 10 },

    counted_score: 0,
    total_score: 0,

};

function handleInputChange(e) {
    const input = e.target;
    const name = input.name;
    const value = input.value;
    const score = parseInt(input.getAttribute('score'), 10);

    // Radio: simple assignment
    if (input.type === 'radio') {
        data[name].answer = value;
        data[name].score = score;

        // Checkbox: rebuild array & score from all checked inputs
    } else if (input.type === 'checkbox') {
        const checkboxes = document.querySelectorAll(`input[type="checkbox"][name="${name}"]`);

        data[name].answer = [];
        data[name].score = 0;

        checkboxes.forEach(box => {
            if (box.checked) {
                const boxScore = parseInt(box.getAttribute('score'), 10);
                data[name].answer.push(box.value);
                data[name].score += boxScore;
            }
        });
    }

    console.log(data);
}


document.querySelectorAll('input[type="radio"]').forEach(input => {
    input.addEventListener('change', handleInputChange);
});

function handleCheckboxInputChange(e) {
    const input = e.target;
    const name = input.name;
    const value = input.value;
    const score = parseInt(input.getAttribute('score'), 10);

    // Initialize the data structure for this question if it doesn't exist
    if (!data[name]) {
        data[name] = { answer: [], score: 0 };
    }

    // Checkbox logic: add or remove the value and update the score
    if (input.checked) {
        data[name].answer.push(value);
        data[name].score += score;
    } else {
        // Remove the value and subtract the score if unchecked
        const index = data[name].answer.indexOf(value);
        if (index > -1) {
            data[name].answer.splice(index, 1);
            data[name].score -= score;
        }
    }

    // Log the data object to see the result
    console.log(data);
}

// Attach event listener for all checkboxes under "welcome"
document.querySelectorAll('input[type="checkbox"][name="welcome"]').forEach(input => {
    input.addEventListener('change', handleCheckboxInputChange);
});