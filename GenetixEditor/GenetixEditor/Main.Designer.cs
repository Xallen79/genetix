namespace GenetixEditor
{
    partial class Main
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.tabControl1 = new System.Windows.Forms.TabControl();
            this.tpBuildings = new System.Windows.Forms.TabPage();
            this.btnAddBuilding = new System.Windows.Forms.Button();
            this.btnLoad = new System.Windows.Forms.Button();
            this.tpResources = new System.Windows.Forms.TabPage();
            this.btnLoadResources = new System.Windows.Forms.Button();
            this.btnSaveBuildings = new System.Windows.Forms.Button();
            this.buildingList = new GenetixEditor.Controls.DropDownTreeView();
            this.resourceList = new GenetixEditor.Controls.DropDownTreeView();
            this.tabControl1.SuspendLayout();
            this.tpBuildings.SuspendLayout();
            this.tpResources.SuspendLayout();
            this.SuspendLayout();
            // 
            // tabControl1
            // 
            this.tabControl1.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.tabControl1.Controls.Add(this.tpBuildings);
            this.tabControl1.Controls.Add(this.tpResources);
            this.tabControl1.Location = new System.Drawing.Point(2, 12);
            this.tabControl1.Name = "tabControl1";
            this.tabControl1.SelectedIndex = 0;
            this.tabControl1.Size = new System.Drawing.Size(459, 427);
            this.tabControl1.TabIndex = 0;
            // 
            // tpBuildings
            // 
            this.tpBuildings.Controls.Add(this.btnSaveBuildings);
            this.tpBuildings.Controls.Add(this.btnAddBuilding);
            this.tpBuildings.Controls.Add(this.buildingList);
            this.tpBuildings.Controls.Add(this.btnLoad);
            this.tpBuildings.Location = new System.Drawing.Point(4, 22);
            this.tpBuildings.Name = "tpBuildings";
            this.tpBuildings.Padding = new System.Windows.Forms.Padding(3);
            this.tpBuildings.Size = new System.Drawing.Size(451, 401);
            this.tpBuildings.TabIndex = 0;
            this.tpBuildings.Text = "Bulidings";
            this.tpBuildings.UseVisualStyleBackColor = true;
            // 
            // btnAddBuilding
            // 
            this.btnAddBuilding.Location = new System.Drawing.Point(87, 6);
            this.btnAddBuilding.Name = "btnAddBuilding";
            this.btnAddBuilding.Size = new System.Drawing.Size(75, 23);
            this.btnAddBuilding.TabIndex = 2;
            this.btnAddBuilding.Text = "Add Building";
            this.btnAddBuilding.UseVisualStyleBackColor = true;
            this.btnAddBuilding.Click += new System.EventHandler(this.btnAddBuilding_Click);
            // 
            // btnLoad
            // 
            this.btnLoad.Location = new System.Drawing.Point(6, 6);
            this.btnLoad.MaximumSize = new System.Drawing.Size(75, 23);
            this.btnLoad.MinimumSize = new System.Drawing.Size(75, 23);
            this.btnLoad.Name = "btnLoad";
            this.btnLoad.Size = new System.Drawing.Size(75, 23);
            this.btnLoad.TabIndex = 0;
            this.btnLoad.Text = "Load Config";
            this.btnLoad.UseVisualStyleBackColor = true;
            this.btnLoad.Click += new System.EventHandler(this.btnLoad_Click);
            // 
            // tpResources
            // 
            this.tpResources.Controls.Add(this.resourceList);
            this.tpResources.Controls.Add(this.btnLoadResources);
            this.tpResources.Location = new System.Drawing.Point(4, 22);
            this.tpResources.Name = "tpResources";
            this.tpResources.Padding = new System.Windows.Forms.Padding(3);
            this.tpResources.Size = new System.Drawing.Size(451, 401);
            this.tpResources.TabIndex = 1;
            this.tpResources.Text = "Resources";
            this.tpResources.UseVisualStyleBackColor = true;
            // 
            // btnLoadResources
            // 
            this.btnLoadResources.Location = new System.Drawing.Point(3, 4);
            this.btnLoadResources.MaximumSize = new System.Drawing.Size(75, 23);
            this.btnLoadResources.MinimumSize = new System.Drawing.Size(75, 23);
            this.btnLoadResources.Name = "btnLoadResources";
            this.btnLoadResources.Size = new System.Drawing.Size(75, 23);
            this.btnLoadResources.TabIndex = 3;
            this.btnLoadResources.Text = "Load Config";
            this.btnLoadResources.UseVisualStyleBackColor = true;
            this.btnLoadResources.Click += new System.EventHandler(this.btnLoadResources_Click);
            // 
            // btnSaveBuildings
            // 
            this.btnSaveBuildings.Location = new System.Drawing.Point(169, 6);
            this.btnSaveBuildings.Name = "btnSaveBuildings";
            this.btnSaveBuildings.Size = new System.Drawing.Size(75, 23);
            this.btnSaveBuildings.TabIndex = 3;
            this.btnSaveBuildings.Text = "Save";
            this.btnSaveBuildings.UseVisualStyleBackColor = true;
            this.btnSaveBuildings.Click += new System.EventHandler(this.btnSaveBuildings_Click);
            // 
            // buildingList
            // 
            this.buildingList.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.buildingList.Location = new System.Drawing.Point(6, 38);
            this.buildingList.Name = "buildingList";
            this.buildingList.Size = new System.Drawing.Size(445, 360);
            this.buildingList.TabIndex = 1;
            this.buildingList.AfterLabelEdit += new System.Windows.Forms.NodeLabelEditEventHandler(this.buildingList_AfterLabelEdit);
            this.buildingList.Click += new System.EventHandler(this.buildingList_Click);
            this.buildingList.MouseDown += new System.Windows.Forms.MouseEventHandler(this.buildingList_MouseDown);
            // 
            // resourceList
            // 
            this.resourceList.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.resourceList.LabelEdit = true;
            this.resourceList.Location = new System.Drawing.Point(3, 36);
            this.resourceList.Name = "resourceList";
            this.resourceList.Size = new System.Drawing.Size(445, 360);
            this.resourceList.TabIndex = 4;
            // 
            // Main
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.BackColor = System.Drawing.SystemColors.Control;
            this.ClientSize = new System.Drawing.Size(465, 444);
            this.Controls.Add(this.tabControl1);
            this.Name = "Main";
            this.Text = "Genetix Editor";
            this.tabControl1.ResumeLayout(false);
            this.tpBuildings.ResumeLayout(false);
            this.tpResources.ResumeLayout(false);
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.TabControl tabControl1;
        private System.Windows.Forms.TabPage tpBuildings;
        private System.Windows.Forms.TabPage tpResources;
        private System.Windows.Forms.Button btnLoad;
        private GenetixEditor.Controls.DropDownTreeView buildingList;
        private System.Windows.Forms.Button btnAddBuilding;
        private Controls.DropDownTreeView resourceList;
        private System.Windows.Forms.Button btnLoadResources;
        private System.Windows.Forms.Button btnSaveBuildings;
    }
}

