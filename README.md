# Work Management Components

## Overview

The Work Management Components are a set of Salesforce Lightning Web Components (LWCs) designed to manage and display work records and associated action items for users within a Salesforce ORG. These components leverage custom objects to retrieve and display relevant data based on the current user's context and interactions with the system.

**Key Features Include:**
- Real-time Data Fetching: The components fetch data immediately upon load, ensuring users have the most up-to-date information.
- Pagination and Sorting: The WorkListViewComponent and WorkCardComponent include pagination features for managing large data sets and sorting capabilities to organize records effectively.
- User-Specific Data: Components are tailored to display data relevant to the current user, such as work items they are assigned to or action items they need to complete.
- Dynamic User Interface: The components adjust their display based on the number of records available, showing pagination controls only when necessary and dynamically updating the content as the user navigates through different records.

**Components Overview**
> **WorkListViewComponent:**
> The WorkListViewComponent is responsible for displaying a list of work records that the current user is associated with. The component supports pagination to handle large data sets and is integrated with the Salesforce Lightning Web Component framework for a seamless user experience.

> **WorkCardComponent:**
> The WorkCardComponent displays detailed action items related to a specific work record. It features pagination that activates when more than four action items are available, and it sorts items by status, prioritizing those that are "Not Started." The component also interacts with other components via messaging channels to ensure data consistency and responsiveness to user interactions.

![Screenshot 2024-08-29 123909](https://github.com/user-attachments/assets/76cff0e6-48fd-4d38-a4c8-ab9739ca9175)

## Features
**Pagination:**
Both the WorkListViewComponent and WorkCardComponent include pagination features, enabling users to navigate through multiple pages of records.
Pagination controls are dynamically displayed based on the number of records retrieved.

**Sorting:**
The WorkCardComponent sorts action items by status, ensuring that items marked as "Not Started" appear first.

**Dynamic Updates:**
The components update their content in real-time as the user navigates between different work records or action items.
The WorkCardComponent automatically resets the pagination to the first page when switching between work records, preventing issues where no records are displayed due to page number inconsistencies.

## Documentation
For more information, please check out the [Wiki](https://github.com/edunzer/WorkListViewComponent/wiki) for this repository. It includes detailed information about each component, including:

- [A Component Overview](https://github.com/edunzer/WorkListViewComponent/wiki)
- [Details about the WorkListView HTML](https://github.com/edunzer/WorkListViewComponent/wikiWorkListViewComponent-HTML)
- [Details about the WorkCardComponent HTML](https://github.com/edunzer/WorkListViewComponent/wiki/WorkCardComponent-HTML)
- [Details about the WorkListView Javascript](https://github.com/edunzer/WorkListViewComponent/wiki/WorkListViewComponent-JavaScript)
- [Details about the WorkCardComponent Javascript](https://github.com/edunzer/WorkListViewComponent/wiki/WorkCardComponent-JavaScript)
- [Details about the WorkCardController](https://github.com/edunzer/WorkListViewComponent/wiki/WorkCardController)
- [Details about the WorkListViewController](https://github.com/edunzer/WorkListViewComponent/wiki/WorkListViewController)
- [Details about the WorkCardComponentController](https://github.com/edunzer/WorkListViewComponent/wiki/WorkCardComponentController)
