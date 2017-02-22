using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace GenetixEditor.Controls
{
    public class DropDownTreeView : TreeView
    {
        public DropDownTreeView() : base()
        {
        }

        private DropDownTreeNode m_CurrentNode = null;

        protected override void
                  OnNodeMouseClick(TreeNodeMouseClickEventArgs e)
        {
            // Are we dealing with a dropdown node?
            if (e.Node is DropDownTreeNode)
            {
                this.m_CurrentNode = (DropDownTreeNode)e.Node;

                // Need to add the node's ComboBox to the
                // TreeView's list of controls for it to work
                this.Controls.Add(this.m_CurrentNode.ComboBox);

                // Set the bounds of the ComboBox, with
                // a little adjustment to make it look right
                this.m_CurrentNode.ComboBox.SetBounds(
                    this.m_CurrentNode.Bounds.X - 1,
                    this.m_CurrentNode.Bounds.Y - 2,
                    this.m_CurrentNode.Bounds.Width + 25,
                    this.m_CurrentNode.Bounds.Height);

                // Listen to the SelectedValueChanged
                // event of the node's ComboBox
                this.m_CurrentNode.ComboBox.SelectedValueChanged +=
                   new EventHandler(ComboBox_SelectedValueChanged);
                this.m_CurrentNode.ComboBox.DropDownClosed +=
                   new EventHandler(ComboBox_DropDownClosed);

                // Now show the ComboBox
                this.m_CurrentNode.ComboBox.Show();
                this.m_CurrentNode.ComboBox.DroppedDown = true;
            }
            base.OnNodeMouseClick(e);
        }

        void ComboBox_SelectedValueChanged(object sender, EventArgs e)
        {           
            HideComboBox();
        }

        void ComboBox_DropDownClosed(object sender, EventArgs e)
        {
            HideComboBox();
        }

        private void HideComboBox()
        {
            if (this.m_CurrentNode != null)
            {
                // Unregister the event listener
                this.m_CurrentNode.ComboBox.SelectedValueChanged -=
                                     ComboBox_SelectedValueChanged;
                this.m_CurrentNode.ComboBox.DropDownClosed -=
                                     ComboBox_DropDownClosed;

                // Copy the selected text from the ComboBox to the TreeNode
                this.m_CurrentNode.Text = this.m_CurrentNode.ComboBox.Text;

                // Hide the ComboBox
                this.m_CurrentNode.ComboBox.Hide();
                this.m_CurrentNode.ComboBox.DroppedDown = false;

                // Remove the control from the TreeView's
                // list of currently-displayed controls
                this.Controls.Remove(this.m_CurrentNode.ComboBox);

                this.OnAfterLabelEdit(new NodeLabelEditEventArgs(this.m_CurrentNode, this.m_CurrentNode.Text));
                // And return to the default state (no ComboBox displayed)
                this.m_CurrentNode = null;
                
            }

        }
    }
}
