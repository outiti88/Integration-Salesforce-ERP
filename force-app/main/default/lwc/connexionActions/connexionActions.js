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
}

function reduceErrors(errors) {
  if (!Array.isArray(errors)) {
    errors = [errors];
  }

  return (
    errors
      // Remove null/undefined items
      .filter((error) => !!error)
      // Extract an error message
      .map((error) => {
        // UI API read errors
        if (Array.isArray(error.body)) {
          return error.body.map((e) => e.message);
        }
        // UI API DML, Apex and network errors
        else if (error.body && typeof error.body.message === "string") {
          return error.body.message;
        }
        // JS errors
        else if (typeof error.message === "string") {
          return error.message;
        }
        // Validation Rules Errors
        else if (error.body.fieldErrors) {
          const { fieldErrors } = error.body;
          const errorMessages = [];
          for (const key in fieldErrors) {
            errorMessages.push({
              title: fieldErrors[key][0].statusCode,
              message: fieldErrors[key][0].message
            });
          }
          return errorMessages;
        }
        // Unknown error shape so try HTTP status text
        return error.statusText;
      })
      // Flatten
      .reduce((prev, curr) => prev.concat(curr), [])
      // Remove empty strings
      .filter((message) => !!message)
  );
}
