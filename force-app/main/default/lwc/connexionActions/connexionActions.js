import { LightningElement, api, wire, track } from "lwc";
import getIsBasic from "@salesforce/apex/ConnexionController.getIsBasic";
import getConnexionPassword from "@salesforce/apex/ConnexionController.getConnexionPassword";
import negateActivation from "@salesforce/apex/ConnexionController.negateActivation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { getRecordNotifyChange } from "lightning/uiRecordApi";
import { reduceErrors } from "c/helpers";

export default class ConnexionActions extends LightningElement {

  @api recordId;

  @track
  inputValues = {
    oldPassword : "",
    newPassword : "",
    confirmNewPassword : ""
  }

  errorMessage = "";
  
  isBasic;
  error;
  isEditPassword = false;


  get displayAlert(){
    return this.errorMessage.length > 0;
  }

  onHandleChange(event) {
    this.inputValues = {
      ...this.inputValues,
      [event.target.name] : event.target.value
    }
  }

  @wire(getIsBasic, { connexionId: "$recordId" })
  wiredConnextionType({ error, data }) {
    if (error) {
      this.error = error;
    }
    this.isBasic = data;
  }

  showToast(options) {
    const event = new ShowToastEvent(options);
    this.dispatchEvent(event);
  }

  async handleActivation() {
    try {
        const newActivationState = await negateActivation({
          connexionId: this.recordId
        });
        let options = {
          title: "Deactivation of connexion",
          message: "You have successfuly disbaled this connexion",
          variant: "error"
        };
        if (newActivationState) {
          options = {
            title: "Activation of connexion",
            message: "You have successfuly enabled this connexion",
            variant: "success"
          };
        }
        getRecordNotifyChange([{ recordId: this.recordId }]);
        this.showToast(options);
    } catch (error) {
        reduceErrors(error).map((err) =>
        this.showToast({
          title: err.title,
          message: err.message,
          variant: "error"
        })
      );
    }
  }


  handleEditPassword(){
    this.isEditPassword = true;
  }
  handleCancel(){
    this.isEditPassword = false;
  }
  

  async handleSubmit(){   
    if(this.isFormFilled())
    {
      if(this.isPasswordsEquals()) {
        try {
          const connexionPassword = await getConnexionPassword({connexionId : this.recordId});
          if(connexionPassword !== this.inputValues.oldPassword){
            this.errorMessage = "Wrong old password";
          }
        } catch(error){
          console.log(error);
        }
      } else {
        this.errorMessage = "The two passwords doesn't match";
      }
    }
    else{
      this.errorMessage = "All fields are required";
    }
  }

  isFormFilled(){
    let isEmpty = true;
    for(let key in this.inputValues){
      isEmpty = isEmpty && this.inputValues[key] !== ""
    }

    return isEmpty;
  }

  isPasswordsEquals(){
    return this.inputValues.newPassword === this.inputValues.confirmNewPassword;
  }


}

