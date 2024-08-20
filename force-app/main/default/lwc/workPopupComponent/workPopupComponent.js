import { LightningElement, api } from 'lwc';

export default class WorkPopupComponent extends LightningElement {
    @api isVisible = false;
    @api recordId;

    handleClose() {
        this.isVisible = false;
        const closeEvent = new CustomEvent('close');
        this.dispatchEvent(closeEvent);
    }

    @api open(recordId) {
        this.recordId = recordId;
        this.isVisible = true;
    }
}
