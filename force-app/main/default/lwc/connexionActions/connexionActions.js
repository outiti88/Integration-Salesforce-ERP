import { LightningElement, api, wire } from "lwc";
import getIsBasic from "@salesforce/apex/ConnexionController.getIsBasic";
import negateActivation from "@salesforce/apex/ConnexionController.negateActivation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { getRecordNotifyChange } from "lightning/uiRecordApi";
import { reduceErrors } from "c/helpers";

export default class ConnexionActions extends LightningElement {
  @api recordId;

  isBasic;
  error;
  isEditPassword = false;

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

  handleSubmit(){

  }


}

