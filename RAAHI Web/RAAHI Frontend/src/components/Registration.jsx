import React, { useState, useEffect } from 'react';

const Registration = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: 'Anike', 
    idType: 'Passport', 
    idNumber: 'A1234567', 
    dob: '1990-01-01', 
    gender: 'Male', 
    nationality: 'Indian', 
    phone: '+919876543210', 
    email: 'anike@example.com', 
    medical: '', 
    agree: false
  });
  const [itinerary, setItinerary] = useState([{ place: 'Delhi', from: '2025-10-01', to: '2025-10-05' }]);
  const [emergency, setEmergency] = useState([{ name: 'Kishan', relation: 'Friend', phone: '+919876543211' }]);
  const [isSuccessful, setIsSuccessful] = useState(false);

  useEffect(() => {
    // Update progress bar and button visibility based on current step
    const progressFill = document.getElementById("registration-progress");
    if(progressFill) {
      progressFill.style.width = `${(currentStep / 4) * 100}%`;
    }
  }, [currentStep]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleItineraryChange = (index, e) => {
    const { name, value } = e.target;
    const newItinerary = [...itinerary];
    newItinerary[index][name] = value;
    setItinerary(newItinerary);
  };

  const handleAddItinerary = () => {
    setItinerary(prevItinerary => [...prevItinerary, { place: '', from: '', to: '' }]);
  };

  const handleRemoveItinerary = (index) => {
    setItinerary(prevItinerary => prevItinerary.filter((_, i) => i !== index));
  };
  
  const handleNext = () => {
    // Basic validation
    if (currentStep < 4) {
      setCurrentStep(prevStep => prevStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prevStep => prevStep - 1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.agree) {
      setIsSuccessful(true);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div id="step-1" className="registration-step active">
            <div className="card">
              <div className="card-header"><h3 className="card-title">Step 1: Personal Details & KYC</h3></div>
              <div className="card-content">
                <div className="form-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} />
                  <div className="error-message" id="error-fullName"></div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="idType">ID Type</label>
                    <select id="idType" name="idType" value={formData.idType} onChange={handleInputChange}>
                      <option value="Passport">Passport</option>
                      <option value="Aadhaar">Aadhaar</option>
                      <option value="Voter ID">Voter ID</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="idNumber">Passport/Aadhaar No.</label>
                    <input type="text" id="idNumber" name="idNumber" value={formData.idNumber} onChange={handleInputChange} />
                    <div className="error-message" id="error-idNumber"></div>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="dob">Date of Birth</label>
                    <input type="date" id="dob" name="dob" value={formData.dob} onChange={handleInputChange} />
                    <div className="error-message" id="error-dob"></div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="gender">Gender</label>
                    <select id="gender" name="gender" value={formData.gender} onChange={handleInputChange}>
                      <option value="">Prefer not to say</option>
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="nationality">Nationality</label>
                    <input type="text" id="nationality" name="nationality" value={formData.nationality} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">Phone</label>
                    <input type="tel" id="phone" name="phone" placeholder="+911234567890" value={formData.phone} onChange={handleInputChange} />
                    <div className="error-message" id="error-phone"></div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} />
                    <div className="error-message" id="error-email"></div>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="kycUpload">Upload KYC (Passport/Aadhaar PDF or Image)</label>
                  <input type="file" id="kycUpload" accept="image/*,.pdf" />
                  <div id="upload-status"></div>
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div id="step-2" className="registration-step active">
            <div className="card">
              <div className="card-header"><h3 className="card-title">Step 2: Itinerary</h3></div>
              <div className="card-content">
                <p className="form-description">Add cities or places you plan to visit and dates. This helps in delivering targeted alerts.</p>
                <div id="itinerary-container">
                  {itinerary.map((item, index) => (
                    <div className="itinerary-item" key={index}>
                      <div className="item-header">
                        <div className="item-title">Stop {index + 1}</div>
                        {index > 0 && <button type="button" className="btn btn-outline btn-sm" onClick={() => handleRemoveItinerary(index)}>Remove</button>}
                      </div>
                      <div className="form-group"><label>Place/City</label><input type="text" name="place" value={item.place} onChange={(e) => handleItineraryChange(index, e)} /></div>
                      <div className="form-row">
                        <div className="form-group"><label>From</label><input type="date" name="from" value={item.from} onChange={(e) => handleItineraryChange(index, e)} /></div>
                        <div className="form-group"><label>To</label><input type="date" name="to" value={item.to} onChange={(e) => handleItineraryChange(index, e)} /></div>
                      </div>
                    </div>
                  ))}
                </div>
                <button type="button" className="btn btn-outline btn-sm" onClick={handleAddItinerary}>Add another stop</button>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div id="step-3" className="registration-step active">
            <div className="card">
              <div className="card-header"><h3 className="card-title">Step 3: Emergency Contacts & Medical</h3></div>
              <div className="card-content">
                <p className="form-description">Provide at least one emergency contact and any medical conditions we should be aware of.</p>
                {/* Emergency contacts logic needs to be implemented */}
                <div id="emergency-container">
                    {emergency.map((contact, index) => (
                        <div className="emergency-contact" key={index}>
                            <div className="item-header">
                                <div className="item-title">Contact {index + 1}</div>
                                {/* Add remove button if needed */}
                            </div>
                            <div className="form-group"><label>Full Name</label><input type="text" name="name" value={contact.name} /></div>
                            <div className="form-group"><label>Relation</label><input type="text" name="relation" value={contact.relation} /></div>
                            <div className="form-group"><label>Phone</label><input type="tel" name="phone" value={contact.phone} /></div>
                        </div>
                    ))}
                </div>
                <button type="button" className="btn btn-outline btn-sm" id="add-emergency">Add another contact</button>
                <div className="form-group">
                  <label htmlFor="medical">Medical conditions / Allergies (optional)</label>
                  <textarea id="medical" name="medical" rows="3" value={formData.medical} onChange={handleInputChange}></textarea>
                </div>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div id="step-4" className="registration-step active">
            <div className="card">
              <div className="card-header"><h3 className="card-title">Step 4: Review & Confirm</h3></div>
              <div className="card-content">
                <div id="review-summary">
                  <div><strong>Name:</strong> {formData.fullName}</div>
                  <div><strong>ID:</strong> {formData.idType} - {formData.idNumber}</div>
                  <div><strong>DOB:</strong> {formData.dob}</div>
                  <div><strong>Phone:</strong> {formData.phone}</div>
                  <div><strong>Email:</strong> {formData.email}</div>
                </div>
                <div className="checkbox-group">
                  <input type="checkbox" id="agree" name="agree" checked={formData.agree} onChange={handleInputChange} />
                  <label htmlFor="agree">
                    I confirm that the information provided is accurate and consent to use my data 
                    for safety and response purposes. 
                    <a href="#" className="link">Privacy Policy</a>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderSuccessScreen = () => (
    <div id="registration-success" className="registration-success">
      <h1>Registration Successful</h1>
      <p>Your digital Tourist ID is ready. Share or save it for verification.</p>
      <div className="success-content">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">ID Card Preview (QR-enabled)</h3>
          </div>
          <div className="card-content">
            <div className="tourist-id-final" id="final-id-card">
              <div className="id-card">
                <div className="id-header">
                  <h4>Tourist ID</h4>
                  <div className="id-number">ST-PAS-{formData.idNumber.slice(-4)}</div>
                </div>
                <div className="id-body">
                  <div className="id-name">{formData.fullName}</div>
                  <div className="qr-placeholder">QR</div>
                </div>
              </div>
            </div>
            <div className="kyc-status" id="final-kyc-status">
              KYC: Not uploaded
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Registration Details</h3>
          </div>
          <div className="card-content" id="final-details">
            <div><strong>Name:</strong> {formData.fullName}</div>
            <div><strong>ID:</strong> ST-PAS-{formData.idNumber.slice(-4)}</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section id="register" className="page active">
      <div className="container">
        {isSuccessful ? (
          renderSuccessScreen()
        ) : (
          <>
            <div className="registration-header">
              <h1>Tourist Registration</h1>
              <p>Complete the steps to generate your digital Tourist ID.</p>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" id="registration-progress"></div>
            </div>
            <div className="registration-content">
              <div className="registration-form">
                {renderStepContent()}
                <div className="registration-nav">
                  <button type="button" className="btn btn-outline" id="back-btn" disabled={currentStep === 1} onClick={handleBack}>Back</button>
                  {currentStep < 4 && <button type="button" className="btn btn-primary" id="next-btn" onClick={handleNext}>Continue</button>}
                  {currentStep === 4 && <button type="button" className="btn btn-success" id="submit-btn" disabled={!formData.agree} onClick={handleSubmit}>Confirm & Generate ID</button>}
                </div>
              </div>
              <div className="registration-sidebar">
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Preview</h3>
                  </div>
                  <div className="card-content">
                    <div className="tourist-id-preview" id="id-preview">
                      <div className="id-card">
                        <div className="id-header">
                          <h4>Tourist ID</h4>
                          <div className="id-number" id="preview-id">ST-TEMP-0001</div>
                        </div>
                        <div className="id-body">
                          <div className="id-name" id="preview-name">{formData.fullName || 'Tourist'}</div>
                          <div className="qr-placeholder">QR Code</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Tips</h3>
                  </div>
                  <div className="card-content tips">
                    <p>Use official documents for KYC verification.</p>
                    <p>Provide accurate emergency contacts for safety.</p>
                    <p>Keep location services enabled for timely alerts and assistance.</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Registration;