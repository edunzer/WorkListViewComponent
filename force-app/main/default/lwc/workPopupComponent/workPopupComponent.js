import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { publish, MessageContext } from 'lightning/messageService';
import WORK_ITEM_MESSAGE_CHANNEL from '@salesforce/messageChannel/WorkItemMessageChannel__c';

export default class WorkPopupComponent extends LightningElement {
    @api isVisible = false;
    @api recordId;

    @wire(MessageContext)
    messageContext;

    handleClose() {
        this.isVisible = false;
        const closeEvent = new CustomEvent('close');
        this.dispatchEvent(closeEvent);
    }

    @api open(recordId) {
        this.recordId = recordId;
        this.isVisible = true;
    }

    handleSuccess() {
        // Show a success toast message
        const toastEvent = new ShowToastEvent({
            title: 'Success',
            message: 'Record updated successfully',
            variant: 'success'
        });
        this.dispatchEvent(toastEvent);

        // Publish a message to notify the workCardComponent to refresh
        const message = {
            recordId: this.recordId
        };
        publish(this.messageContext, WORK_ITEM_MESSAGE_CHANNEL, message);

        // Close the modal after a successful save
        this.handleClose();
    }
}
