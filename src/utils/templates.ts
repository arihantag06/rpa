import { type Workflow } from '../types/workflow';

/**
 * Predefined workflow templates that can be imported directly into the app
 */

export const workflowTemplates: Workflow[] = [
  {
    id: 'template-admin-staff-creation',
    name: 'Create Admin Staff - SNC Novocuris',
    description: 'Automates the process of logging into SNC Novocuris and creating a new admin staff member',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    steps: [
      {
        id: 'step-1',
        type: 'navigate',
        title: 'Navigate to Login Page',
        description: 'Go to SNC Novocuris login page',
        config: {
          url: 'https://snc.novocuris.org'
        },
        order: 1
      },
      {
        id: 'step-2',
        type: 'type',
        title: 'Enter Email',
        description: 'Type email address in login form',
        config: {
          xpath: '/html/body/div/div/div[2]/div[2]/div/div[2]/div/form/div[1]/div/input',
          text: 'kerem@novocuris.com'
        },
        order: 2
      },
      {
        id: 'step-3',
        type: 'type',
        title: 'Enter Password',
        description: 'Type password in login form',
        config: {
          xpath: '/html/body/div/div/div[2]/div[2]/div/div[2]/div/form/div[2]/div/input',
          text: 'Admin123!SNC'
        },
        order: 3
      },
      {
        id: 'step-4',
        type: 'click',
        title: 'Click Login Button',
        description: 'Submit the login form',
        config: {
          xpath: '/html/body/div/div/div[2]/div[2]/div/div[2]/div/form/div[5]/button'
        },
        order: 4
      },
      {
        id: 'step-5',
        type: 'navigate',
        title: 'Navigate to Create Admin Staff',
        description: 'Go to the admin staff creation page',
        config: {
          url: 'https://snc.novocuris.org/home/admin-staff/create'
        },
        order: 5
      },
      {
        id: 'step-6',
        type: 'type',
        title: 'Enter Staff Email',
        description: 'Type email for new admin staff',
        config: {
          xpath: "//input[@name='email']",
          text: 'test@gmail.com'
        },
        order: 6
      },
      {
        id: 'step-7',
        type: 'type',
        title: 'Enter Phone Number',
        description: 'Type phone number for new admin staff',
        config: {
          xpath: "//*[@id='root']/div/div[2]/div[2]/main/div/form/div[1]/div/div[2]/div/div[2]/div/div/input",
          text: '9808618970'
        },
        order: 7
      },
      {
        id: 'step-8',
        type: 'type',
        title: 'Enter First Name',
        description: 'Type first name for new admin staff',
        config: {
          xpath: "//*[@id='root']/div/div[2]/div[2]/main/div/form/div[1]/div/div[2]/div/div[3]/div/div/input",
          text: 'Saideep'
        },
        order: 8
      },
      {
        id: 'step-9',
        type: 'type',
        title: 'Enter Last Name',
        description: 'Type last name for new admin staff',
        config: {
          xpath: "//*[@id='root']/div/div[2]/div[2]/main/div/form/div[1]/div/div[2]/div/div[4]/div/div/input",
          text: 'Gogineni'
        },
        order: 9
      },
      {
        id: 'step-10',
        type: 'click',
        title: 'Open Branch Dropdown',
        description: 'Click on the branch select dropdown',
        config: {
          xpath: "//*[@id='root']/div/div[2]/div[2]/main/div/form/div[1]/div/div[2]/div/div[5]/div/div/div/div"
        },
        order: 10
      },
      {
        id: 'step-11',
        type: 'click',
        title: 'Select SNC Branch',
        description: 'Select SNC from branch options',
        config: {
          xpath: "//div[contains(@class, 'css-1nmdiq5-menu')]//div[text()='SNC']"
        },
        order: 11
      },
      {
        id: 'step-12',
        type: 'click',
        title: 'Open Role Dropdown',
        description: 'Click on the role select dropdown',
        config: {
          xpath: "//*[@id='root']/div/div[2]/div[2]/main/div/form/div[1]/div/div[2]/div/div[6]/div/div/div/div"
        },
        order: 12
      },
      {
        id: 'step-13',
        type: 'click',
        title: 'Select Super Admin Role',
        description: 'Select Super admin from role options',
        config: {
          xpath: "//div[contains(@class, '-menu')]//div[text()='Super admin']"
        },
        order: 13
      },
      {
        id: 'step-14',
        type: 'click',
        title: 'Click Add Admin Staff Button',
        description: 'Click on the add admin staff button',
        config: {
          xpath: "//*[@id='root']/div/div[2]/div[2]/main/div/form/div[2]/button[2]"
        },
        order: 14
      }
    ]
  }
];

/**
 * Helper function to import a template into the workflow system
 * This generates a new workflow with unique IDs based on the template
 */
export function createWorkflowFromTemplate(template: Workflow): Workflow {
  const timestamp = Date.now();
  return {
    ...template,
    id: `workflow-${timestamp}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    steps: template.steps.map((step, index) => ({
      ...step,
      id: `step-${timestamp}-${index}`,
      order: index + 1
    }))
  };
}