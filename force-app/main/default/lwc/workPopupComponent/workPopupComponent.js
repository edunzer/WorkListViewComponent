import { LightningElement, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { publish, MessageContext } from 'lightning/messageService';
import WORK_ITEM_MESSAGE_CHANNEL from '@salesforce/messageChannel/WorkItemMessageChannel__c';

export default class WorkPopupComponent extends LightningElement {
    @api isVisible = false;
    @api workItemActionId;

    @wire(MessageContext)
    messageContext;

    connectedCallback() {
        console.log('workPopupComponent connected.');
        console.log('Subscribed to WorkItemMessageChannel');
    }

    handleClose() {
        this.isVisible = false;
        const closeEvent = new CustomEvent('close');
        this.dispatchEvent(closeEvent);
        console.log('Modal closed.');
    }

    @api open(workItemActionId) {
        this.workItemActionId = workItemActionId;
        this.isVisible = true;
        console.log('Modal opened for workItemActionId:', this.workItemActionId);
    }

    handleSuccess() {
        // Show a success toast message
        const toastEvent = new ShowToastEvent({
            title: 'Success',
            message: 'Record updated successfully',
            variant: 'success'
        });
        this.dispatchEvent(toastEvent);
        console.log('Record updated successfully, showing toast.');

        // Publish a message to notify the workCardComponent to refresh
        const message = {
            workItemActionId: this.workItemActionId
        };
        publish(this.messageContext, WORK_ITEM_MESSAGE_CHANNEL, message);
        console.log('Message published to WorkItemMessageChannel:', message);

        // Close the modal after a successful save
        this.handleClose();
    }
}
