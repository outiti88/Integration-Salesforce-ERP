import { LightningElement, api, wire } from "lwc";
import getIsBasic from "@salesforce/apex/ConnexionController.getIsBasic";
import negateActivation from "@salesforce/apex/ConnexionController.negateActivation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { getRecordNotifyChange } from "lightning/uiRecordApi";

export default class ConnexionActions extends LightningElement {
  @api recordId;

  isBasic;
  error;

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
        title: "Activation status",
        message: "You have successfuly disbaled this connexion",
        variant: "error"
      };
      if (newActivationState) {
        options = {
          title: "Activation status",
          message: "You have successfuly enabled this connexion",
          variant: "success"
        };
      }
      getRecordNotifyChange([{ recordId: this.recordId }]);
      this.showToast(options);
    } catch (error) {
      console.log(error);
    }
  }
}
