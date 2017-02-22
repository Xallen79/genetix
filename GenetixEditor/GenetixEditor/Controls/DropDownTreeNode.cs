using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace GenetixEditor.Controls
{
    class DropDownTreeNode : TreeNode
    {
        public DropDownTreeNode() : base()
        {

        }
        public DropDownTreeNode(string name) : base(name)
        {

        }
        private ComboBox m_ComboBox = new ComboBox();
        public ComboBox ComboBox
        {
            get
            {
                this.m_ComboBox.DropDownStyle = ComboBoxStyle.DropDownList;
                return this.m_ComboBox;
            }
            set
            {
                this.m_ComboBox = value;
                this.m_ComboBox.DropDownStyle = ComboBoxStyle.DropDownList;
            }
        }
    }
}
