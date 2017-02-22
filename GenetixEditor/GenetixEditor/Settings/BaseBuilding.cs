using GenetixEditor.Controls;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace GenetixEditor.Settings
{
    class BaseBuilding
    {

        public enum BuildingUse
        {
            breeding,
            housing,
            newborn,
            production,
            storage

        };

        [JsonProperty("name")]
        public string Name { get; set; }
        [JsonProperty("description")]
        public string Description { get; set; }
        [JsonProperty("use")]
        public BuildingUse Use { get; set; }
        [JsonProperty("size")]
        public int Size { get; set; }
        [JsonProperty("baseCost")]
        public object[] baseCost { get; set; }
        [JsonProperty("purchased")]
        public int Purchased { get; set; }
        [JsonProperty("gifted")]
        public int Gifted { get; set; }
        [JsonProperty("unlocked")]
        public bool Unlocked { get; set; }
        [JsonProperty("multiplier")]
        public double Multiplier { get; set; }
        [JsonProperty("stores")]
        public string Stores { get; set; }
        [JsonProperty("produces")]
        public string Produces { get; set; }


        public BaseBuilding()
        {
            Name = "";
            Description = "";
            Use = BuildingUse.breeding;
            Size = 0;
            baseCost = new object[0];
            Purchased = 0;
            Gifted = 1;
            Unlocked = false;
            Multiplier = 1;
            Produces = "";
            Stores = "";

        }

        internal void AddNodes(TreeNode root)
        {
            root.Nodes.Add("name").Nodes.Add(this.Name);
            root.Nodes.Add("description").Nodes.Add(this.Description);
            var useNode = new DropDownTreeNode(this.Use.ToString());
            foreach (var u in Enum.GetNames(typeof(BuildingUse)))
            {
                useNode.ComboBox.Items.Add(u);
            }

            root.Nodes.Add("use").Nodes.Add(useNode);
            root.Nodes.Add("size").Nodes.Add(this.Size.ToString());

            var costNode = root.Nodes.Add("baseCost");
            if (this.baseCost.Length == 0) costNode.Nodes.Add("");
            else
            {
                int i = 0;
                foreach (JObject cost in this.baseCost)
                {
                    var node = costNode.Nodes.Add(i.ToString());
                    foreach (JProperty prop in cost.Properties())
                    {
                        node.Nodes.Add(prop.Name).Nodes.Add(prop.Value.ToString());
                    }
                    i++;
                }
            }

            root.Nodes.Add("purchased").Nodes.Add(this.Purchased.ToString());
            root.Nodes.Add("gifted").Nodes.Add(this.Gifted.ToString());
            root.Nodes.Add("unlocked").Nodes.Add(this.Unlocked.ToString());
            root.Nodes.Add("multiplier").Nodes.Add(this.Multiplier.ToString());
            root.Nodes.Add("stores").Nodes.Add(this.Stores);
            root.Nodes.Add("produces").Nodes.Add(this.Produces);

        }


        internal void Update(string prop, string value)
        {
            switch (prop)
            {
                case "name":
                    this.Name = value;
                    break;
                case "description":
                    this.Description = value;
                    break;
                case "use":
                    this.Use = (BuildingUse)Enum.Parse(typeof(BuildingUse), value);
                    break;
                case "size":
                    this.Size = Int32.Parse(value);
                    break;
                case "purchased":
                    this.Purchased = Int32.Parse(value);
                    break;
                case "gifted":
                    this.Gifted = Int32.Parse(value);
                    break;
                case "unlocked":
                    this.Unlocked = Boolean.Parse(value);
                    break;
                case "multiplier":
                    this.Multiplier = Double.Parse(value);
                    break;
                case "stores":
                    this.Stores = value;
                    break;
                case "produces":
                    this.Produces = value;
                    break;
            }
        }
    }
}
