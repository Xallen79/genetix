using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Configuration;
using GenetixEditor.Settings;
using Newtonsoft.Json;
using System.IO;

namespace GenetixEditor
{
    public partial class Main : Form
    {
        string servicesPath = ConfigurationManager.AppSettings["servicesDirectory"];
        TreeNode selectedBuildingNode;
        TreeNode selectedBuildingNodeRoot;
        RootBuilding buildings;


        public Main()
        {
            InitializeComponent();

        }
        


        private void btnLoad_Click(object sender, EventArgs e)
        {
            var buildingsFile = servicesPath + "\\buildingService.settings.json";
            buildings = JsonConvert.DeserializeObject<Constants<RootBuilding>>(File.ReadAllText(buildingsFile)).Config;
            buildingList.Nodes.Clear();
            foreach(var o in buildings.Buildings)
            {
                var node = buildingList.Nodes.Add(o.Key);                
                var building = o.Value;
                building.AddNodes(node);
            }
        }

        private void buildingList_Click(object sender, EventArgs e)
        {
            if ((selectedBuildingNode != null && selectedBuildingNode.Parent != null && selectedBuildingNode.Nodes.Count == 0) || (selectedBuildingNode.Parent == null && selectedBuildingNode.Text == "<NotSet>"))
            {
                selectedBuildingNodeRoot = selectedBuildingNode;
                while (selectedBuildingNodeRoot.Parent != null) selectedBuildingNodeRoot = selectedBuildingNodeRoot.Parent;
                buildingList.SelectedNode = selectedBuildingNode;
                buildingList.LabelEdit = true;
                if (!selectedBuildingNode.IsEditing)
                {
                    selectedBuildingNode.BeginEdit();
                }
            }
        }

        private void buildingList_AfterLabelEdit(object sender, NodeLabelEditEventArgs e)
        {
            if (e.Label == null) return;
            var building = buildings.Buildings[selectedBuildingNodeRoot.Text];
            if(e.Node.Parent == null)
            {
                buildings.Buildings.Remove(selectedBuildingNodeRoot.Text);
                buildings.Buildings.Add(e.Label, building);
            }
            else
            {
                building.Update(e.Node.Parent.Text, e.Label);
            }

        }

        private void buildingList_MouseDown(object sender, MouseEventArgs e)
        {
            selectedBuildingNode = buildingList.GetNodeAt(e.X, e.Y);
        }

        private void btnAddBuilding_Click(object sender, EventArgs e)
        {
            
            var building = new BaseBuilding();
            building.AddNodes(buildingList.Nodes.Add("<NotSet>"));
            buildings.Buildings.Add("<NotSet>", building);

        }
        private void btnSaveBuildings_Click(object sender, EventArgs e)
        {
            var c = new Constants<RootBuilding>();
            c.Config = buildings;
            File.WriteAllText("buildingService.settings.json", JsonConvert.SerializeObject(c, Formatting.Indented));
        }

        private void btnLoadResources_Click(object sender, EventArgs e)
        {
            var resourceFile = servicesPath + "\\resourceService.settings.json";
            RootResource r = JsonConvert.DeserializeObject<Constants<RootResource>>(File.ReadAllText(resourceFile)).Config;
            resourceList.Nodes.Clear();
            foreach (var o in r.ResourceTypes)
            {
                var node = resourceList.Nodes.Add(o.Key);
                var resource = o.Value;
                resource.AddNodes(node);
            }
        }

    }
}
