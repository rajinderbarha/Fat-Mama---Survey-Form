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

// For Checkboxes
document.querySelectorAll('input[type="radio"]').forEach(input => {
    input.addEventListener('change', (e) => {
        const name = e.target.name;  // like 'cleanliness', 'greeted'...
        const value = e.target.value;
        data[name] = value;
    });
});

// For Checkboxes (Multiple Values)
document.querySelectorAll('input[type="checkbox"]').forEach(input => {
    input.addEventListener('change', (e) => {
        const name = e.target.name;  // Always 'welcome' here
        const value = e.target.value;

        if (e.target.checked) {
            data[name].push(value);
        } else {
            data[name] = data[name].filter(item => item !== value);
        }
    });
});

// For Textarea 
document.querySelector('textarea[name="dissatisfaction_reason"]').addEventListener('input', (e) => {
    data.dissatisfaction_reason = e.target.value;
});

// For Textarea 
document.querySelector('textarea[name="best_part_of_visit"]').addEventListener('input', (e) => {
    data.best_part_of_visit = e.target.value;
});

// For Textarea 
document.querySelector('textarea[name="improve_experience"]').addEventListener('input', (e) => {
    data.improve_experience = e.target.value;
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
            cleanliness: data.cleanliness,
            greeted: data.greeted,
            welcome: data.welcome.join(', '),
            seated: data.seated,
            qr_informed: data.qr_informed,
            server_friendly: data.server_friendly,
            recommendations: data.recommendations,
            order_repeated: data.order_repeated,
            food_allergies: data.food_allergies,
            drinks_time: data.drinks_time,
            food_time: data.food_time,
            server_check: data.server_check,
            second_offer: data.second_offer,
            table_cleaned: data.table_cleaned,
            starter_rating: data.starter_rating,
            main_course_rating: data.main_course_rating,
            dessert_rating: data.dessert_rating,
            drink_rating: data.drink_rating,
            dissatisfied: data.dissatisfied,
            dissatisfaction_reason: data.dissatisfaction_reason,
            raise_problem: data.raise_problem,
            uploads: data.uploads.map(url => ({ url })),  // mow working  
            payment_process: data.payment_process,
            receipt_upload:  [{ url: data.receipt_upload }], // working on it
            service_charge_info: data.service_charge_info,
            tip_pressure: data.tip_pressure,
            asked_for_review: data.asked_for_review,
            honest_review_expected: data.honest_review_expected,
            got_complimentary: data.got_complimentary,
            goodbye_experience: data.goodbye_experience,
            restaurant_cleanliness: data.restaurant_cleanliness,
            best_part_of_visit: data.best_part_of_visit,
            improve_experience: data.improve_experience,
            recommend_likelihood: data.recommend_likelihood,
        }
    };

    try {
        const response = await fetch(airtableUrl, {
            method: 'POST',
            headers: airtableHeaders,
            body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error('Failed to submit to Airtable');
        if (response.ok) console.log("Response Status:", response.status);
        console.log("Airtable Response:", await response.json());
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
    cleanliness: "",
    greeted: "",
    welcome: [],
    seated: "",
    qr_informed: "",
    server_friendly: "",
    recommendations: "",
    order_repeated: "",
    food_allergies: "",
    drinks_time: "",
    food_time: "",
    server_check: "",
    second_offer: "",
    table_cleaned: "",
    starter_rating: "",
    main_course_rating: "",
    dessert_rating: "",
    drink_rating: "",
    dissatisfied: "",
    dissatisfaction_reason: "",
    raise_problem: "",
    uploads: [],
    payment_process: "",
    receipt_upload: "",
    service_charge_info: "",
    tip_pressure: "",
    asked_for_review: "",
    honest_review_expected: "",
    got_complimentary: "",
    goodbye_experience: "",
    restaurant_cleanliness: "",
    best_part_of_visit: "",
    improve_experience: "",
    recommend_likelihood: "",
};